package com.meson.service;

import com.meson.dto.*;
import com.meson.entity.*;
import com.meson.exception.BadRequestException;
import com.meson.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class StudentGroupRequestService {

    private final StudentGroupRequestRepository studentGroupRequestRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final DirectionGroupRepository directionGroupRepository;
    private final CourseGroupRepository courseGroupRepository;
    private final DirectionGroupService directionGroupService;
    private final UserRepository userRepository;
    private final ScheduleSessionRepository scheduleSessionRepository;
    private final ScheduleSessionService scheduleSessionService;
    private final StudentGroupSelectionRepository studentGroupSelectionRepository;

    @Transactional(readOnly = true)
    public StudentScheduleOverviewResponse getScheduleOverview(Long userId) {
        StudentGroupStatusResponse status = buildStudentStatus(userId);
        List<ScheduleSessionResponse> approvedSchedules = List.of();
        List<AvailableDirectionGroupResponse> availableGroups = List.of();

        if (status.isHasApprovedGroup() && status.getApprovedGroup() != null) {
            approvedSchedules = loadApprovedSchedules(userId, status.getApprovedGroup().getId());
        } else if (status.isCategoryAssigned()) {
            availableGroups = buildAvailableGroups(userId, status);
        }

        return StudentScheduleOverviewResponse.builder()
                .status(status)
                .availableGroups(availableGroups)
                .approvedSchedules(approvedSchedules)
                .build();
    }

    @Transactional(readOnly = true)
    public StudentGroupStatusResponse getStudentStatus(Long userId) {
        return buildStudentStatus(userId);
    }

    @Transactional(readOnly = true)
    public List<AvailableDirectionGroupResponse> getAvailableGroups(Long userId) {
        StudentGroupStatusResponse status = buildStudentStatus(userId);
        if (!status.isCategoryAssigned() || status.isHasApprovedGroup()) {
            return List.of();
        }
        return buildAvailableGroups(userId, status);
    }

    @Transactional
    public StudentGroupRequestResponse apply(Long userId, ApplyGroupRequest request) {
        StudentProfile profile = requireStudentProfile(userId);
        validateStudentCategory(profile);

        if (profile.getApprovedDirectionGroup() != null) {
            throw new RuntimeException("Ke tashme nje grup te aprovuar");
        }

        if (studentGroupRequestRepository.existsByStudentIdAndStatus(userId, GroupRequestStatus.PENDING)) {
            throw new RuntimeException("Ke nje aplikim ne pritje");
        }

        DirectionGroup group = directionGroupService.getEntity(request.getDirectionGroupId());
        validateGroupMatchesStudent(profile, group);
        directionGroupService.assertGroupAcceptsStudents(group);

        User student = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Studenti nuk u gjet"));

        StudentGroupRequest application = StudentGroupRequest.builder()
                .student(student)
                .directionGroup(group)
                .status(GroupRequestStatus.PENDING)
                .appliedAt(LocalDateTime.now())
                .build();

        return toResponse(studentGroupRequestRepository.save(application));
    }

    @Transactional
    public DirectionGroupResponse selectGroup(Long userId, ApplyGroupRequest request) {
        StudentProfile profile = requireStudentProfile(userId);
        validateStudentCategory(profile);

        if (profile.getApprovedDirectionGroup() != null || studentGroupSelectionRepository.existsByStudentId(userId)) {
            throw new BadRequestException("Ke zgjedhur tashme nje grup");
        }

        DirectionGroup group = directionGroupService.getEntity(request.getDirectionGroupId());
        validateGroupMatchesStudent(profile, group);
        directionGroupService.assertGroupAcceptsStudents(group);

        User student = userRepository.findById(userId)
                .orElseThrow(() -> new BadRequestException("Studenti nuk u gjet"));

        rejectPendingApplications(userId, null);
        profile.setApprovedDirectionGroup(group);
        studentProfileRepository.save(profile);

        studentGroupSelectionRepository.save(StudentGroupSelection.builder()
                .student(student)
                .directionGroup(group)
                .selectedAt(LocalDateTime.now())
                .build());

        return directionGroupService.toResponse(group);
    }

    @Transactional
    public StudentGroupRequestResponse approve(Long requestId, Long adminUserId) {
        StudentGroupRequest request = getRequest(requestId);
        if (request.getStatus() != GroupRequestStatus.PENDING) {
            throw new RuntimeException("Vetem aplikimet ne pritje mund te aprovohen");
        }

        DirectionGroup group = request.getDirectionGroup();
        directionGroupService.assertGroupAcceptsStudents(group);

        User admin = userRepository.findById(adminUserId)
                .orElseThrow(() -> new RuntimeException("Admini nuk u gjet"));

        StudentProfile profile = studentProfileRepository.findByUserId(request.getStudent().getId())
                .orElseThrow(() -> new RuntimeException("Profili i studentit nuk u gjet"));

        assignStudentToGroup(profile, group, admin);

        request.setStatus(GroupRequestStatus.APPROVED);
        request.setApprovedAt(LocalDateTime.now());
        request.setApprovedBy(admin);

        return toResponse(studentGroupRequestRepository.save(request));
    }

    @Transactional
    public StudentGroupRequestResponse reject(Long requestId, Long adminUserId) {
        StudentGroupRequest request = getRequest(requestId);
        if (request.getStatus() != GroupRequestStatus.PENDING) {
            throw new RuntimeException("Vetem aplikimet ne pritje mund te refuzohen");
        }

        User admin = userRepository.findById(adminUserId)
                .orElseThrow(() -> new RuntimeException("Admini nuk u gjet"));

        request.setStatus(GroupRequestStatus.REJECTED);
        request.setApprovedAt(LocalDateTime.now());
        request.setApprovedBy(admin);

        return toResponse(studentGroupRequestRepository.save(request));
    }

    @Transactional
    public DirectionGroupResponse adminAssignStudent(Long userId, AssignStudentGroupRequest request, Long adminUserId) {
        StudentProfile profile = requireStudentProfile(userId);
        validateStudentCategory(profile);

        if (profile.getApprovedDirectionGroup() != null) {
            throw new RuntimeException("Studenti ka tashme nje grup te aprovuar");
        }

        DirectionGroup group = directionGroupService.getEntity(request.getDirectionGroupId());
        validateGroupMatchesStudent(profile, group);
        directionGroupService.assertGroupAcceptsStudents(group);

        User admin = userRepository.findById(adminUserId)
                .orElseThrow(() -> new RuntimeException("Admini nuk u gjet"));

        rejectPendingApplications(userId, admin);
        assignStudentToGroup(profile, group, admin);

        return directionGroupService.toResponse(group);
    }

    @Transactional
    public void adminRemoveStudent(Long userId) {
        StudentProfile profile = requireStudentProfile(userId);
        if (profile.getApprovedDirectionGroup() == null) {
            throw new RuntimeException("Studenti nuk eshte ne asnje grup");
        }
        profile.setApprovedDirectionGroup(null);
        studentProfileRepository.save(profile);
    }

    @Transactional(readOnly = true)
    public List<StudentGroupRequestResponse> getAdminRequests(
            GroupRequestStatus status, Long categoryId, Long directionGroupId) {
        return studentGroupRequestRepository.findAdminRequests(status, categoryId, directionGroupId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private void assignStudentToGroup(StudentProfile profile, DirectionGroup group, User admin) {
        if (profile.getApprovedDirectionGroup() != null) {
            throw new RuntimeException("Studenti ka tashme nje grup te aprovuar");
        }
        directionGroupService.assertGroupAcceptsStudents(group);
        validateGroupMatchesStudent(profile, group);

        profile.setApprovedDirectionGroup(group);
        studentProfileRepository.save(profile);
    }

    private void rejectPendingApplications(Long userId, User admin) {
        studentGroupRequestRepository
                .findByStudentIdAndStatus(userId, GroupRequestStatus.PENDING)
                .ifPresent(pending -> {
                    pending.setStatus(GroupRequestStatus.REJECTED);
                    pending.setApprovedAt(LocalDateTime.now());
                    if (admin != null) {
                        pending.setApprovedBy(admin);
                    }
                    studentGroupRequestRepository.save(pending);
                });
    }

    private void validateGroupMatchesStudent(StudentProfile profile, DirectionGroup group) {
        if (!group.getCourseCategory().getId().equals(profile.getCourseCategory().getId())) {
            throw new RuntimeException("Ky grup nuk i perket drejtimit tend");
        }
        int studentSemester = profile.getCurrentSemester() != null ? profile.getCurrentSemester() : 1;
        if (!group.getSemester().equals(studentSemester)) {
            throw new RuntimeException("Ky grup nuk i perket semestrit tend");
        }
    }

    private StudentGroupStatusResponse buildStudentStatus(Long userId) {
        Optional<StudentProfile> profileOpt = studentProfileRepository.findByUserIdWithDetails(userId);

        if (profileOpt.isEmpty()) {
            return StudentGroupStatusResponse.builder()
                    .hasApprovedGroup(false)
                    .categoryAssigned(false)
                    .build();
        }

        StudentProfile profile = profileOpt.get();
        CourseCategory category = profile.getCourseCategory();

        DirectionGroupResponse approved = null;
        if (profile.getApprovedDirectionGroup() != null) {
            approved = directionGroupService.toResponse(profile.getApprovedDirectionGroup());
        }

        StudentGroupRequestResponse pending = studentGroupRequestRepository
                .findByStudentIdAndStatus(userId, GroupRequestStatus.PENDING)
                .map(this::toResponse)
                .orElse(null);

        return StudentGroupStatusResponse.builder()
                .hasApprovedGroup(approved != null)
                .categoryAssigned(category != null)
                .categoryId(category != null ? category.getId() : null)
                .categoryName(category != null ? category.getEmertimi() : null)
                .currentSemester(profile.getCurrentSemester())
                .approvedGroup(approved)
                .pendingRequest(pending)
                .build();
    }

    private List<AvailableDirectionGroupResponse> buildAvailableGroups(
            Long userId, StudentGroupStatusResponse status) {
        Optional<StudentProfile> profileOpt = studentProfileRepository.findByUserIdWithDetails(userId);
        if (profileOpt.isEmpty() || profileOpt.get().getCourseCategory() == null) {
            return List.of();
        }

        StudentProfile profile = profileOpt.get();
        Long categoryId = profile.getCourseCategory().getId();
        Integer semester = profile.getCurrentSemester() != null ? profile.getCurrentSemester() : 1;

        boolean hasPending = status.getPendingRequest() != null;
        List<DirectionGroup> directionGroups = resolveDirectionGroupsForCategory(categoryId, semester);

        List<AvailableDirectionGroupResponse> result = new ArrayList<>();
        for (DirectionGroup group : directionGroups) {
            result.add(buildAvailableGroupEntry(group, semester, false, hasPending));
        }
        return result;
    }

    private List<DirectionGroup> resolveDirectionGroupsForCategory(Long categoryId, Integer semester) {
        List<DirectionGroup> groups =
                directionGroupRepository.findByCategoryIdAndSemesterWithCategory(categoryId, semester);
        if (!groups.isEmpty()) {
            return groups;
        }

        List<DirectionGroup> linked =
                courseGroupRepository.findDistinctDirectionGroupsByCategoryId(categoryId);
        return linked.stream()
                .filter(g -> semester.equals(g.getSemester()))
                .toList();
    }

    private AvailableDirectionGroupResponse buildAvailableGroupEntry(
            DirectionGroup group, Integer semester, boolean hasApproved, boolean hasPending) {
        DirectionGroupResponse groupInfo = directionGroupService.toResponse(group);
        List<ScheduleSessionResponse> schedules = scheduleSessionRepository
                .findByDirectionGroupIdAndSemester(group.getId(), semester)
                .stream()
                .map(scheduleSessionService::toResponse)
                .filter(java.util.Objects::nonNull)
                .toList();

        String blockedReason = null;
        boolean canApply = true;

        if (hasApproved) {
            canApply = false;
            blockedReason = "Ke tashme nje grup te aprovuar";
        } else if (hasPending) {
            canApply = false;
            blockedReason = "Ke nje aplikim ne pritje";
        } else if ("CLOSED".equals(groupInfo.getStatus())) {
            canApply = false;
            blockedReason = "Grupi eshte i mbyllur";
        } else if (Boolean.TRUE.equals(groupInfo.getIsFull())) {
            canApply = false;
            blockedReason = "Grupi eshte plote";
        }

        return AvailableDirectionGroupResponse.builder()
                .group(groupInfo)
                .schedules(schedules != null ? schedules : List.of())
                .canApply(canApply)
                .applyBlockedReason(blockedReason)
                .build();
    }

    private List<ScheduleSessionResponse> loadApprovedSchedules(Long userId, Long directionGroupId) {
        Optional<StudentProfile> profileOpt = studentProfileRepository.findByUserIdWithDetails(userId);
        if (profileOpt.isEmpty() || profileOpt.get().getCourseCategory() == null) {
            return List.of();
        }

        StudentProfile profile = profileOpt.get();
        return scheduleSessionRepository.findApprovedSchedulesForStudent(
                        profile.getCourseCategory().getId(),
                        profile.getCurrentSemester() != null ? profile.getCurrentSemester() : 1,
                        directionGroupId)
                .stream()
                .map(scheduleSessionService::toResponse)
                .filter(java.util.Objects::nonNull)
                .toList();
    }

    private StudentGroupRequest getRequest(Long requestId) {
        return studentGroupRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Aplikimi nuk u gjet"));
    }

    private StudentProfile requireStudentProfile(Long userId) {
        return studentProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Profili i studentit nuk u gjet"));
    }

    private void validateStudentCategory(StudentProfile profile) {
        if (profile.getCourseCategory() == null) {
            throw new RuntimeException("Drejtimi nuk eshte caktuar per kete student");
        }
    }

    private StudentGroupRequestResponse toResponse(StudentGroupRequest request) {
        if (request == null) {
            return null;
        }
        User student = request.getStudent();
        DirectionGroup group = request.getDirectionGroup();
        User approver = request.getApprovedBy();
        if (student == null || group == null) {
            return null;
        }
        CourseCategory category = group.getCourseCategory();

        return StudentGroupRequestResponse.builder()
                .id(request.getId())
                .studentId(student.getId())
                .studentFirstName(student.getEmri())
                .studentLastName(student.getMbiemri())
                .studentEmail(student.getEmail())
                .categoryId(category != null ? category.getId() : null)
                .categoryName(category != null ? category.getEmertimi() : null)
                .directionGroupId(group.getId())
                .directionGroupName(group.getName())
                .status(request.getStatus())
                .appliedAt(request.getAppliedAt())
                .approvedAt(request.getApprovedAt())
                .approvedById(approver != null ? approver.getId() : null)
                .approvedByName(approver != null ? approver.getEmri() + " " + approver.getMbiemri() : null)
                .build();
    }
}
