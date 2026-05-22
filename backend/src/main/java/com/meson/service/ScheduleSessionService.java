package com.meson.service;

import com.meson.dto.ScheduleSessionRequest;
import com.meson.dto.ScheduleSessionResponse;
import com.meson.entity.*;
import com.meson.exception.BadRequestException;
import com.meson.exception.ResourceNotFoundException;
import com.meson.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ScheduleSessionService {

    private static final int DEFAULT_SESSION_MINUTES = 90;

    private final ScheduleSessionRepository scheduleSessionRepository;
    private final CourseRepository courseRepository;
    private final CourseGroupRepository courseGroupRepository;
    private final CourseSubgroupRepository courseSubgroupRepository;
    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final ScheduleConflictValidator conflictValidator;

    @Transactional(readOnly = true)
    public List<ScheduleSessionResponse> getAll() {
        return scheduleSessionRepository.findAllWithDetails().stream()
                .map(this::toResponse)
                .filter(java.util.Objects::nonNull)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ScheduleSessionResponse> getForStudent(Long userId) {
        StudentProfile profile = studentProfileRepository.findByUserIdWithDetails(userId).orElse(null);

        if (profile == null || profile.getCourseCategory() == null || profile.getApprovedDirectionGroup() == null) {
            return List.of();
        }

        return scheduleSessionRepository.findApprovedSchedulesForStudent(
                        profile.getCourseCategory().getId(),
                        profile.getCurrentSemester() != null ? profile.getCurrentSemester() : 1,
                        profile.getApprovedDirectionGroup().getId())
                .stream()
                .map(this::toResponse)
                .filter(java.util.Objects::nonNull)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ScheduleSessionResponse> getForTeacher(Long teacherId) {
        return scheduleSessionRepository.findByTeacherIdWithDetails(teacherId).stream()
                .map(this::toResponse)
                .filter(java.util.Objects::nonNull)
                .toList();
    }

    public ScheduleSessionResponse create(ScheduleSessionRequest request) {
        throw new BadRequestException(
                "Oraret krijohen vetem brenda wizard-it te grupit. Shkoni te Menaxhimi i Grupeve.");
    }

    public ScheduleSessionResponse update(Long id, ScheduleSessionRequest request) {
        throw new BadRequestException(
                "Oraret perditesohen vetem brenda menaxhimit te grupit. Shkoni te Menaxhimi i Grupeve.");
    }

    public void delete(Long id) {
        if (!scheduleSessionRepository.existsById(id)) {
            throw new ResourceNotFoundException("Orari nuk u gjet");
        }
        scheduleSessionRepository.deleteById(id);
    }

    void validateSessionForWizard(ScheduleSession candidate, List<ScheduleSession> pending, Long excludeId) {
        if (candidate == null || candidate.getTeacher() == null) {
            throw new BadRequestException("Orari nuk eshte i vlefshem: mesuesi mungon");
        }
        if (candidate.getStartTime() == null || candidate.getEndTime() == null) {
            throw new BadRequestException("Orari nuk eshte i vlefshem: ora e fillimit ose mbarimit mungon");
        }
        conflictValidator.validateSession(candidate, pending, excludeId);
    }

    public ScheduleSessionResponse toResponse(ScheduleSession session) {
        if (session == null || session.getCourse() == null || session.getTeacher() == null) {
            return null;
        }

        User teacher = session.getTeacher();
        Course course = session.getCourse();
        CourseCategory category = course.getCourseCategory();
        CourseGroup courseGroup = session.getCourseGroup();
        CourseSubgroup subgroup = session.getCourseSubgroup();

        String teacherName = trimJoin(teacher.getEmri(), teacher.getMbiemri());

        return ScheduleSessionResponse.builder()
                .id(session.getId())
                .courseId(course.getId())
                .courseTitle(course.getTitulli())
                .categoryId(category != null ? category.getId() : null)
                .categoryName(category != null ? category.getEmertimi() : null)
                .semester(course.getSemester())
                .courseGroupId(courseGroup != null ? courseGroup.getId() : null)
                .courseGroupName(courseGroup != null ? courseGroup.getName() : null)
                .courseSubgroupId(subgroup != null ? subgroup.getId() : null)
                .courseSubgroupName(subgroup != null ? subgroup.getName() : null)
                .teacherId(teacher.getId())
                .teacherName(teacherName.isEmpty() ? "—" : teacherName)
                .sessionType(session.getSessionType())
                .dayOfWeek(session.getDayOfWeek())
                .startTime(session.getStartTime())
                .endTime(session.getEndTime())
                .room(session.getRoom())
                .capacity(session.getCapacity())
                .status(session.getStatus())
                .build();
    }

    private static String trimJoin(String first, String last) {
        String a = first != null ? first.trim() : "";
        String b = last != null ? last.trim() : "";
        return (a + " " + b).trim();
    }
}
