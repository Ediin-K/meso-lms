package com.meson.service;

import com.meson.dto.*;
import com.meson.entity.CourseCategory;
import com.meson.entity.DirectionGroup;
import com.meson.entity.DirectionGroupStatus;
import com.meson.entity.StudentProfile;
import com.meson.repository.CourseCategoryRepository;
import com.meson.repository.DirectionGroupRepository;
import com.meson.repository.StudentProfileRepository;
import com.meson.exception.BadRequestException;
import com.meson.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DirectionGroupService {

    private final DirectionGroupRepository directionGroupRepository;
    private final CourseCategoryRepository courseCategoryRepository;
    private final StudentProfileRepository studentProfileRepository;

    @Transactional(readOnly = true)
    public List<DirectionGroupResponse> getByCategory(Long categoryId, Integer semester) {
        List<DirectionGroup> groups = semester != null
                ? directionGroupRepository.findByCategoryIdAndSemesterWithCategory(categoryId, semester)
                : directionGroupRepository.findByCategoryIdWithCategory(categoryId);
        return groups.stream().map(this::toResponse).toList();
    }

    @Transactional
    public DirectionGroupResponse create(Long categoryId, DirectionGroupRequest request) {
        CourseCategory category = courseCategoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Kategoria nuk u gjet"));

        validateRequest(request);
        int semester = request.getSemester();

        if (directionGroupRepository.existsByCourseCategoryIdAndSemesterAndNameIgnoreCase(
                categoryId, semester, request.getName())) {
            throw new BadRequestException("Ky grup ekziston tashme per kete drejtim dhe semestrin");
        }

        DirectionGroup group = DirectionGroup.builder()
                .courseCategory(category)
                .semester(semester)
                .name(request.getName().trim())
                .description(trimToNull(request.getDescription()))
                .maxCapacity(request.getMaxCapacity())
                .status(resolveStoredStatus(request.getStatus()))
                .build();

        return toResponse(directionGroupRepository.save(group));
    }

    @Transactional
    public DirectionGroupResponse update(Long groupId, DirectionGroupRequest request) {
        DirectionGroup group = directionGroupRepository.findByIdWithCategory(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Grupi i drejtimit nuk u gjet"));

        validateRequest(request);
        Long categoryId = group.getCourseCategory().getId();
        int semester = request.getSemester() != null ? request.getSemester() : group.getSemester();

        if (!group.getName().equalsIgnoreCase(request.getName())
                && directionGroupRepository.existsByCourseCategoryIdAndSemesterAndNameIgnoreCase(
                        categoryId, semester, request.getName())) {
            throw new BadRequestException("Ky grup ekziston tashme per kete drejtim dhe semestrin");
        }

        if (request.getMaxCapacity() < getCurrentStudents(groupId)) {
            throw new BadRequestException("Kapaciteti nuk mund te jete me i vogel se numri aktual i studenteve");
        }

        group.setSemester(semester);
        group.setName(request.getName().trim());
        group.setDescription(trimToNull(request.getDescription()));
        group.setMaxCapacity(request.getMaxCapacity());
        if (request.getStatus() != null) {
            group.setStatus(resolveStoredStatus(request.getStatus()));
        }
        return toResponse(directionGroupRepository.save(group));
    }

    @Transactional
    public void delete(Long groupId) {
        if (getCurrentStudents(groupId) > 0) {
            throw new BadRequestException("Grupi ka studente te aprovuar dhe nuk mund te fshihet");
        }
        directionGroupRepository.deleteById(groupId);
    }

    @Transactional(readOnly = true)
    public DirectionGroup getEntity(Long groupId) {
        return directionGroupRepository.findByIdWithCategory(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Grupi i drejtimit nuk u gjet"));
    }

    public int getCurrentStudents(Long directionGroupId) {
        return (int) studentProfileRepository.countByApprovedDirectionGroupId(directionGroupId);
    }

    public void assertGroupAcceptsStudents(DirectionGroup group) {
        if (group.getStatus() == DirectionGroupStatus.CLOSED) {
            throw new BadRequestException("Grupi eshte i mbyllur");
        }
        DirectionGroupResponse info = toResponse(group);
        if (Boolean.TRUE.equals(info.getIsFull())) {
            throw new BadRequestException("Grupi eshte plote");
        }
    }

    public List<StudentGroupMemberResponse> getMembers(Long groupId) {
        getEntity(groupId);
        return studentProfileRepository.findMembersByDirectionGroupId(groupId).stream()
                .map(this::toMemberResponse)
                .filter(java.util.Objects::nonNull)
                .toList();
    }

    public DirectionGroupResponse toResponse(DirectionGroup group) {
        if (group == null) {
            return null;
        }
        int current = getCurrentStudents(group.getId());
        int max = group.getMaxCapacity() != null ? group.getMaxCapacity() : 0;
        int remaining = Math.max(0, max - current);
        boolean isFull = max > 0 && current >= max;
        CourseCategory category = group.getCourseCategory();

        return DirectionGroupResponse.builder()
                .id(group.getId())
                .categoryId(category != null ? category.getId() : null)
                .categoryName(category != null ? category.getEmertimi() : null)
                .semester(group.getSemester())
                .name(group.getName())
                .description(group.getDescription())
                .maxCapacity(max)
                .currentStudents(current)
                .remainingSeats(remaining)
                .isFull(isFull)
                .status(computeDisplayStatus(group.getStatus(), isFull))
                .build();
    }

    private StudentGroupMemberResponse toMemberResponse(StudentProfile profile) {
        if (profile == null || profile.getUser() == null) {
            return null;
        }
        var user = profile.getUser();
        return StudentGroupMemberResponse.builder()
                .userId(user.getId())
                .firstName(user.getEmri())
                .lastName(user.getMbiemri())
                .email(user.getEmail())
                .currentSemester(profile.getCurrentSemester())
                .build();
    }

    private void validateRequest(DirectionGroupRequest request) {
        if (request.getSemester() == null || request.getSemester() < 1 || request.getSemester() > 12) {
            throw new BadRequestException("Semestri duhet te jete midis 1 dhe 12");
        }
        if (request.getMaxCapacity() == null || request.getMaxCapacity() < 1) {
            throw new BadRequestException("Kapaciteti duhet te jete te pakten 1");
        }
    }

    private DirectionGroupStatus resolveStoredStatus(DirectionGroupStatus status) {
        return status == DirectionGroupStatus.CLOSED ? DirectionGroupStatus.CLOSED : DirectionGroupStatus.ACTIVE;
    }

    private String trimToNull(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        return value.trim();
    }

    private String computeDisplayStatus(DirectionGroupStatus stored, boolean isFull) {
        if (stored == DirectionGroupStatus.CLOSED) {
            return "CLOSED";
        }
        if (isFull) {
            return "FULL";
        }
        return "ACTIVE";
    }
}
