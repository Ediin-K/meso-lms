package com.meson.service;

import com.meson.dto.*;
import com.meson.entity.*;
import com.meson.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CourseGroupService {

    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final CourseGroupRepository courseGroupRepository;
    private final CourseSubgroupRepository courseSubgroupRepository;
    private final CourseGroupTeacherRepository courseGroupTeacherRepository;
    private final CourseSubgroupTeacherRepository courseSubgroupTeacherRepository;
    private final DirectionGroupRepository directionGroupRepository;

    public List<CourseGroupResponse> getByCourse(Long courseId) {
        return courseGroupRepository.findByCourseId(courseId)
                .stream()
                .map(this::toGroupResponse)
                .toList();
    }

    @Transactional
    public CourseGroupResponse createGroup(Long courseId, CourseGroupRequest request) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Kursi nuk u gjet"));

        if (courseGroupRepository.existsByCourseIdAndNameIgnoreCase(courseId, request.getName())) {
            throw new RuntimeException("Ky grup ekziston tashme per kete kurs");
        }

        CourseGroup group = CourseGroup.builder()
                .course(course)
                .name(request.getName())
                .capacity(request.getCapacity())
                .schedule(request.getSchedule())
                .directionGroup(resolveDirectionGroup(course, request.getDirectionGroupId()))
                .build();

        CourseGroup saved = courseGroupRepository.save(group);
        syncGroupTeachers(saved, request.getTeacherIds());
        return toGroupResponse(saved);
    }

    @Transactional
    public CourseGroupResponse updateGroup(Long groupId, CourseGroupRequest request) {
        CourseGroup group = courseGroupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Grupi nuk u gjet"));

        group.setName(request.getName());
        group.setCapacity(request.getCapacity());
        group.setSchedule(request.getSchedule());
        group.setDirectionGroup(resolveDirectionGroup(group.getCourse(), request.getDirectionGroupId()));
        CourseGroup saved = courseGroupRepository.save(group);
        syncGroupTeachers(saved, request.getTeacherIds());
        return toGroupResponse(saved);
    }

    @Transactional
    public void deleteGroup(Long groupId) {
        if (!courseGroupRepository.existsById(groupId)) {
            throw new RuntimeException("Grupi nuk u gjet");
        }
        courseGroupRepository.deleteById(groupId);
    }

    @Transactional
    public CourseSubgroupResponse createSubgroup(Long groupId, CourseSubgroupRequest request) {
        CourseGroup group = courseGroupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Grupi nuk u gjet"));

        if (courseSubgroupRepository.existsByCourseGroupIdAndNameIgnoreCase(groupId, request.getName())) {
            throw new RuntimeException("Ky nengrup ekziston tashme per kete grup");
        }

        CourseSubgroup subgroup = CourseSubgroup.builder()
                .courseGroup(group)
                .name(request.getName())
                .capacity(request.getCapacity())
                .schedule(request.getSchedule())
                .build();

        CourseSubgroup saved = courseSubgroupRepository.save(subgroup);
        syncSubgroupTeachers(saved, request.getAssistantIds());
        return toSubgroupResponse(saved);
    }

    @Transactional
    public CourseSubgroupResponse updateSubgroup(Long subgroupId, CourseSubgroupRequest request) {
        CourseSubgroup subgroup = courseSubgroupRepository.findById(subgroupId)
                .orElseThrow(() -> new RuntimeException("Nengrupi nuk u gjet"));

        subgroup.setName(request.getName());
        subgroup.setCapacity(request.getCapacity());
        subgroup.setSchedule(request.getSchedule());
        CourseSubgroup saved = courseSubgroupRepository.save(subgroup);
        syncSubgroupTeachers(saved, request.getAssistantIds());
        return toSubgroupResponse(saved);
    }

    @Transactional
    public void deleteSubgroup(Long subgroupId) {
        if (!courseSubgroupRepository.existsById(subgroupId)) {
            throw new RuntimeException("Nengrupi nuk u gjet");
        }
        courseSubgroupRepository.deleteById(subgroupId);
    }

    private void syncGroupTeachers(CourseGroup group, List<Long> teacherIds) {
        courseGroupTeacherRepository.deleteByCourseGroupId(group.getId());
        if (teacherIds == null) return;

        for (Long teacherId : teacherIds) {
            User teacher = userRepository.findById(teacherId)
                    .orElseThrow(() -> new RuntimeException("Mesuesi nuk u gjet"));
            courseGroupTeacherRepository.save(CourseGroupTeacher.builder()
                    .courseGroup(group)
                    .teacher(teacher)
                    .role("PROFESSOR")
                    .build());
        }
    }

    private void syncSubgroupTeachers(CourseSubgroup subgroup, List<Long> assistantIds) {
        courseSubgroupTeacherRepository.deleteByCourseSubgroupId(subgroup.getId());
        if (assistantIds == null) return;

        for (Long assistantId : assistantIds) {
            User assistant = userRepository.findById(assistantId)
                    .orElseThrow(() -> new RuntimeException("Asistenti nuk u gjet"));
            courseSubgroupTeacherRepository.save(CourseSubgroupTeacher.builder()
                    .courseSubgroup(subgroup)
                    .teacher(assistant)
                    .role("ASSISTANT")
                    .build());
        }
    }

    private DirectionGroup resolveDirectionGroup(Course course, Long directionGroupId) {
        if (directionGroupId == null) {
            return null;
        }
        DirectionGroup directionGroup = directionGroupRepository.findById(directionGroupId)
                .orElseThrow(() -> new RuntimeException("Grupi i drejtimit nuk u gjet"));
        if (course.getCourseCategory() == null
                || !course.getCourseCategory().getId().equals(directionGroup.getCourseCategory().getId())) {
            throw new RuntimeException("Grupi i drejtimit nuk i perket kategorise se kursit");
        }
        return directionGroup;
    }

    private CourseGroupResponse toGroupResponse(CourseGroup group) {
        return CourseGroupResponse.builder()
                .id(group.getId())
                .courseId(group.getCourse().getId())
                .name(group.getName())
                .capacity(group.getCapacity())
                .schedule(group.getSchedule())
                .directionGroupId(group.getDirectionGroup() != null ? group.getDirectionGroup().getId() : null)
                .directionGroupName(group.getDirectionGroup() != null ? group.getDirectionGroup().getName() : null)
                .teachers(courseGroupTeacherRepository.findByCourseGroupId(group.getId()).stream()
                        .map(this::toTeacherResponse)
                        .toList())
                .subgroups(courseSubgroupRepository.findByCourseGroupId(group.getId()).stream()
                        .map(this::toSubgroupResponse)
                        .toList())
                .build();
    }

    private CourseSubgroupResponse toSubgroupResponse(CourseSubgroup subgroup) {
        return CourseSubgroupResponse.builder()
                .id(subgroup.getId())
                .courseGroupId(subgroup.getCourseGroup().getId())
                .name(subgroup.getName())
                .capacity(subgroup.getCapacity())
                .schedule(subgroup.getSchedule())
                .assistants(courseSubgroupTeacherRepository.findByCourseSubgroupId(subgroup.getId()).stream()
                        .map(this::toTeacherResponse)
                        .toList())
                .build();
    }

    private AssignedTeacherResponse toTeacherResponse(CourseGroupTeacher assignment) {
        User teacher = assignment.getTeacher();
        return AssignedTeacherResponse.builder()
                .id(teacher.getId())
                .name(teacher.getEmri() + " " + teacher.getMbiemri())
                .email(teacher.getEmail())
                .role(assignment.getRole())
                .build();
    }

    private AssignedTeacherResponse toTeacherResponse(CourseSubgroupTeacher assignment) {
        User teacher = assignment.getTeacher();
        return AssignedTeacherResponse.builder()
                .id(teacher.getId())
                .name(teacher.getEmri() + " " + teacher.getMbiemri())
                .email(teacher.getEmail())
                .role(assignment.getRole())
                .build();
    }
}
