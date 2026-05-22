package com.meson.service;

import com.meson.dto.*;
import com.meson.entity.*;
import com.meson.exception.BadRequestException;
import com.meson.exception.ResourceNotFoundException;
import com.meson.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class DirectionGroupWizardService {

    private static final int DEFAULT_SESSION_MINUTES = 90;
    private static final String ASSISTANT_SUBGROUP_NAME = "Ushtrime";

    private final DirectionGroupRepository directionGroupRepository;
    private final CourseCategoryRepository courseCategoryRepository;
    private final CourseRepository courseRepository;
    private final CourseGroupRepository courseGroupRepository;
    private final CourseSubgroupRepository courseSubgroupRepository;
    private final CourseGroupTeacherRepository courseGroupTeacherRepository;
    private final CourseSubgroupTeacherRepository courseSubgroupTeacherRepository;
    private final ScheduleSessionRepository scheduleSessionRepository;
    private final UserRepository userRepository;
    private final DirectionGroupService directionGroupService;
    private final CourseGroupService courseGroupService;
    private final ScheduleSessionService scheduleSessionService;
    private final TeacherService teacherService;
    private final ScheduleConflictValidator conflictValidator;

    @Transactional(readOnly = true)
    public DirectionGroupWizardContextResponse getContext(Long categoryId, Integer semester) {
        CourseCategory category = courseCategoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Kategoria nuk u gjet"));

        List<Course> courses = courseRepository.findByCourseCategoryIdAndSemester(categoryId, semester);

        return DirectionGroupWizardContextResponse.builder()
                .categoryId(category.getId())
                .categoryName(category.getEmertimi())
                .semester(semester)
                .courses(courses.stream().map(this::toCourseResponse).toList())
                .teachers(teacherService.getAllTeachers())
                .build();
    }

    @Transactional
    public DirectionGroupWizardResponse createGroupWithSchedule(CreateDirectionGroupWizardRequest request) {
        CourseCategory category = courseCategoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Kategoria nuk u gjet"));

        if (directionGroupRepository.existsByCourseCategoryIdAndSemesterAndNameIgnoreCase(
                request.getCategoryId(), request.getSemester(), request.getName())) {
            throw new BadRequestException("Ky grup ekziston tashme per kete drejtim dhe semestrin");
        }

        DirectionGroup directionGroup = directionGroupRepository.save(DirectionGroup.builder()
                .courseCategory(category)
                .semester(request.getSemester())
                .name(request.getName().trim())
                .maxCapacity(request.getMaxCapacity())
                .status(DirectionGroupStatus.ACTIVE)
                .build());

        Map<Long, CourseGroup> courseGroupByCourseId = new LinkedHashMap<>();

        for (GroupStaffAssignmentRequest staff : request.getStaff()) {
            Course course = resolveCourseForContext(staff.getCourseId(), request.getCategoryId(), request.getSemester());
            validateTeacher(staff.getProfessorId());
            if (staff.getAssistantId() != null) {
                validateTeacher(staff.getAssistantId());
            }

            CourseGroup courseGroup = courseGroupByCourseId.computeIfAbsent(course.getId(), cid -> {
                if (courseGroupRepository.existsByCourseIdAndNameIgnoreCase(cid, request.getName())) {
                    throw new BadRequestException(
                            "Ekziston tashme nje grup kursi me emrin '" + request.getName() + "' per lenden "
                                    + course.getTitulli());
                }
                return courseGroupRepository.save(CourseGroup.builder()
                        .course(course)
                        .name(request.getName())
                        .capacity(request.getMaxCapacity())
                        .directionGroup(directionGroup)
                        .build());
            });

            syncProfessor(courseGroup, staff.getProfessorId());
            if (staff.getAssistantId() != null) {
                syncAssistantSubgroup(courseGroup, staff.getAssistantId());
            }
        }

        Set<Long> staffCourseIds = new HashSet<>();
        for (GroupStaffAssignmentRequest staff : request.getStaff()) {
            staffCourseIds.add(staff.getCourseId());
        }

        List<ScheduleSession> pending = new ArrayList<>();
        List<ScheduleSession> savedSessions = new ArrayList<>();

        for (GroupScheduleEntryRequest entry : request.getSchedules()) {
            if (!staffCourseIds.contains(entry.getCourseId())) {
                throw new BadRequestException(
                        "Lenda e orarit duhet te kete staf te caktuar ne seksionin e stafit akademik");
            }

            Course course = resolveCourseForContext(entry.getCourseId(), request.getCategoryId(), request.getSemester());
            CourseGroup courseGroup = courseGroupByCourseId.get(course.getId());
            if (courseGroup == null) {
                throw new BadRequestException("Grupi i lendes nuk u gjet per orarin: " + course.getTitulli());
            }

            validateTeacher(entry.getProfessorId());
            if (entry.getAssistantId() != null) {
                validateTeacher(entry.getAssistantId());
            }

            LocalTime endTime = entry.getEndTime() != null
                    ? entry.getEndTime()
                    : entry.getStartTime().plusMinutes(DEFAULT_SESSION_MINUTES);

            Long sessionTeacherId = entry.getSessionType() == ScheduleSessionType.EXERCISE
                    && entry.getAssistantId() != null
                    ? entry.getAssistantId()
                    : entry.getProfessorId();

            User teacher = userRepository.findById(sessionTeacherId)
                    .orElseThrow(() -> new ResourceNotFoundException("Mesuesi nuk u gjet"));

            ScheduleSession session = ScheduleSession.builder()
                    .course(course)
                    .courseGroup(courseGroup)
                    .teacher(teacher)
                    .sessionType(entry.getSessionType())
                    .dayOfWeek(entry.getDayOfWeek())
                    .startTime(entry.getStartTime())
                    .endTime(endTime)
                    .room(entry.getRoom())
                    .capacity(request.getMaxCapacity())
                    .status("ACTIVE")
                    .build();

            conflictValidator.validateSessionWithAssistant(
                    session, entry.getAssistantId(), pending, null);

            pending.add(session);
            savedSessions.add(scheduleSessionRepository.save(session));
        }

        List<CourseGroupResponse> courseGroupResponses = new ArrayList<>();
        for (CourseGroup cg : courseGroupByCourseId.values()) {
            courseGroupResponses.add(courseGroupService.getByCourse(cg.getCourse().getId()).stream()
                    .filter(g -> Objects.equals(g.getId(), cg.getId()))
                    .findFirst()
                    .orElseThrow(() -> new ResourceNotFoundException("Grupi i kursit nuk u gjet")));
        }

        return DirectionGroupWizardResponse.builder()
                .group(directionGroupService.toResponse(directionGroup))
                .courseGroups(courseGroupResponses)
                .schedules(savedSessions.stream()
                        .map(scheduleSessionService::toResponse)
                        .filter(Objects::nonNull)
                        .toList())
                .build();
    }

    @Transactional(readOnly = true)
    public DirectionGroupWizardResponse getGroupDetail(Long directionGroupId) {
        DirectionGroup group = directionGroupService.getEntity(directionGroupId);
        List<ScheduleSessionResponse> schedules = scheduleSessionRepository
                .findByDirectionGroupIdAndSemester(group.getId(), group.getSemester())
                .stream()
                .map(scheduleSessionService::toResponse)
                .filter(Objects::nonNull)
                .toList();

        List<CourseGroupResponse> courseGroups = courseGroupRepository
                .findByDirectionGroupId(group.getId())
                .stream()
                .map(cg -> courseGroupService.getByCourse(cg.getCourse().getId()).stream()
                        .filter(g -> Objects.equals(g.getId(), cg.getId()))
                        .findFirst()
                        .orElse(null))
                .filter(Objects::nonNull)
                .toList();

        return DirectionGroupWizardResponse.builder()
                .group(directionGroupService.toResponse(group))
                .courseGroups(courseGroups)
                .schedules(schedules)
                .build();
    }

    private Course resolveCourseForContext(Long courseId, Long categoryId, Integer semester) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Lenda nuk u gjet"));
        if (course.getCourseCategory() == null
                || !course.getCourseCategory().getId().equals(categoryId)) {
            throw new BadRequestException("Lenda nuk i perket drejtimit te zgjedhur");
        }
        if (course.getSemester() == null || !semester.equals(course.getSemester())) {
            throw new BadRequestException("Lenda nuk i perket semestrit te zgjedhur");
        }
        return course;
    }

    private void validateTeacher(Long teacherId) {
        userRepository.findById(teacherId)
                .orElseThrow(() -> new ResourceNotFoundException("Mesuesi nuk u gjet"));
    }

    private void syncProfessor(CourseGroup group, Long professorId) {
        if (group == null || group.getId() == null || professorId == null) {
            throw new BadRequestException("Grupi ose profesori mungon");
        }
        if (!courseGroupTeacherRepository.existsByCourseGroupIdAndTeacherId(group.getId(), professorId)) {
            User teacher = userRepository.findById(professorId)
                    .orElseThrow(() -> new ResourceNotFoundException("Profesori nuk u gjet"));
            courseGroupTeacherRepository.save(CourseGroupTeacher.builder()
                    .courseGroup(group)
                    .teacher(teacher)
                    .role("PROFESSOR")
                    .build());
        }
    }

    private void syncAssistantSubgroup(CourseGroup group, Long assistantId) {
        CourseSubgroup subgroup = courseSubgroupRepository
                .findByCourseGroupId(group.getId())
                .stream()
                .filter(s -> ASSISTANT_SUBGROUP_NAME.equalsIgnoreCase(s.getName()))
                .findFirst()
                .orElseGet(() -> courseSubgroupRepository.save(CourseSubgroup.builder()
                        .courseGroup(group)
                        .name(ASSISTANT_SUBGROUP_NAME)
                        .capacity(group.getCapacity())
                        .build()));

        boolean exists = courseSubgroupTeacherRepository.findByCourseSubgroupId(subgroup.getId()).stream()
                .anyMatch(t -> t.getTeacher() != null && Objects.equals(t.getTeacher().getId(), assistantId));
        if (!exists) {
            User assistant = userRepository.findById(assistantId)
                    .orElseThrow(() -> new ResourceNotFoundException("Asistenti nuk u gjet"));
            courseSubgroupTeacherRepository.save(CourseSubgroupTeacher.builder()
                    .courseSubgroup(subgroup)
                    .teacher(assistant)
                    .role("ASSISTANT")
                    .build());
        }
    }

    private CourseResponse toCourseResponse(Course course) {
        return CourseResponse.builder()
                .id(course.getId())
                .titulli(course.getTitulli())
                .semester(course.getSemester())
                .categoryId(course.getCourseCategory() != null ? course.getCourseCategory().getId() : null)
                .categoryName(course.getCourseCategory() != null ? course.getCourseCategory().getEmertimi() : null)
                .build();
    }
}
