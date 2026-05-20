package com.meson.service;

import com.meson.dto.ScheduleSessionRequest;
import com.meson.dto.ScheduleSessionResponse;
import com.meson.entity.*;
import com.meson.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ScheduleSessionService {

    private static final int DEFAULT_SESSION_MINUTES = 90;
    private static final int MIN_BREAK_MINUTES = 10;

    private final ScheduleSessionRepository scheduleSessionRepository;
    private final CourseRepository courseRepository;
    private final CourseGroupRepository courseGroupRepository;
    private final CourseSubgroupRepository courseSubgroupRepository;
    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;

    public List<ScheduleSessionResponse> getAll() {
        return scheduleSessionRepository.findAll().stream().map(this::toResponse).toList();
    }

    public List<ScheduleSessionResponse> getForStudent(Long userId) {
        StudentProfile profile = studentProfileRepository.findByUserId(userId).orElse(null);

        if (profile == null || profile.getCourseCategory() == null) {
            return List.of();
        }

        return scheduleSessionRepository
                .findByCourseCourseCategoryIdAndCourseSemester(
                        profile.getCourseCategory().getId(),
                        profile.getCurrentSemester())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<ScheduleSessionResponse> getForTeacher(Long teacherId) {
        return scheduleSessionRepository.findByTeacherId(teacherId).stream().map(this::toResponse).toList();
    }

    public ScheduleSessionResponse create(ScheduleSessionRequest request) {
        ScheduleSession session = buildSession(new ScheduleSession(), request);
        validateSession(session, null);
        return toResponse(scheduleSessionRepository.save(session));
    }

    public ScheduleSessionResponse update(Long id, ScheduleSessionRequest request) {
        ScheduleSession session = scheduleSessionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Orari nuk u gjet"));
        buildSession(session, request);
        validateSession(session, id);
        return toResponse(scheduleSessionRepository.save(session));
    }

    public void delete(Long id) {
        if (!scheduleSessionRepository.existsById(id)) {
            throw new RuntimeException("Orari nuk u gjet");
        }
        scheduleSessionRepository.deleteById(id);
    }

    private ScheduleSession buildSession(ScheduleSession session, ScheduleSessionRequest request) {
        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new RuntimeException("Lenda nuk u gjet"));
        User teacher = userRepository.findById(request.getTeacherId())
                .orElseThrow(() -> new RuntimeException("Profesori/asistenti nuk u gjet"));

        CourseGroup group = null;
        if (request.getCourseGroupId() != null) {
            group = courseGroupRepository.findById(request.getCourseGroupId())
                    .orElseThrow(() -> new RuntimeException("Grupi nuk u gjet"));
            if (!group.getCourse().getId().equals(course.getId())) {
                throw new RuntimeException("Grupi nuk i perket kesaj lende");
            }
        }

        CourseSubgroup subgroup = null;
        if (request.getCourseSubgroupId() != null) {
            subgroup = courseSubgroupRepository.findById(request.getCourseSubgroupId())
                    .orElseThrow(() -> new RuntimeException("Nengrupi nuk u gjet"));
            if (group == null) {
                group = subgroup.getCourseGroup();
            }
            if (!subgroup.getCourseGroup().getId().equals(group.getId())) {
                throw new RuntimeException("Nengrupi nuk i perket grupit");
            }
        }

        LocalTime endTime = request.getEndTime() != null
                ? request.getEndTime()
                : request.getStartTime().plusMinutes(DEFAULT_SESSION_MINUTES);

        session.setCourse(course);
        session.setTeacher(teacher);
        session.setCourseGroup(group);
        session.setCourseSubgroup(subgroup);
        session.setSessionType(request.getSessionType());
        session.setDayOfWeek(request.getDayOfWeek());
        session.setStartTime(request.getStartTime());
        session.setEndTime(endTime);
        session.setRoom(request.getRoom());
        session.setCapacity(request.getCapacity() != null ? request.getCapacity() : 30);
        session.setStatus("ACTIVE");
        return session;
    }

    private void validateSession(ScheduleSession candidate, Long currentId) {
        if (!candidate.getEndTime().isAfter(candidate.getStartTime())) {
            throw new RuntimeException("Ora e perfundimit duhet te jete pas ores se fillimit");
        }

        long minutes = java.time.Duration.between(candidate.getStartTime(), candidate.getEndTime()).toMinutes();
        if (minutes != DEFAULT_SESSION_MINUTES) {
            throw new RuntimeException("Ora mesimore duhet te jete 90 minuta");
        }

        List<ScheduleSession> sameDay = scheduleSessionRepository.findByDayOfWeek(candidate.getDayOfWeek());
        for (ScheduleSession existing : sameDay) {
            if (currentId != null && existing.getId().equals(currentId)) {
                continue;
            }

            boolean sameTeacher = existing.getTeacher().getId().equals(candidate.getTeacher().getId());
            boolean sameGroup = candidate.getCourseGroup() != null
                    && existing.getCourseGroup() != null
                    && existing.getCourseGroup().getId().equals(candidate.getCourseGroup().getId());
            boolean sameSubgroup = candidate.getCourseSubgroup() != null
                    && existing.getCourseSubgroup() != null
                    && existing.getCourseSubgroup().getId().equals(candidate.getCourseSubgroup().getId());

            if ((sameTeacher || sameGroup || sameSubgroup) && conflictsWithBreak(existing, candidate)) {
                throw new RuntimeException("Orari ka perplasje ose nuk ka pauze minimale prej 10 minutash");
            }
        }
    }

    private boolean conflictsWithBreak(ScheduleSession a, ScheduleSession b) {
        return a.getStartTime().isBefore(b.getEndTime().plusMinutes(MIN_BREAK_MINUTES))
                && b.getStartTime().isBefore(a.getEndTime().plusMinutes(MIN_BREAK_MINUTES));
    }

    private ScheduleSessionResponse toResponse(ScheduleSession session) {
        User teacher = session.getTeacher();
        Course course = session.getCourse();
        CourseCategory category = course.getCourseCategory();

        return ScheduleSessionResponse.builder()
                .id(session.getId())
                .courseId(course.getId())
                .courseTitle(course.getTitulli())
                .categoryId(category != null ? category.getId() : null)
                .categoryName(category != null ? category.getEmertimi() : null)
                .semester(course.getSemester())
                .courseGroupId(session.getCourseGroup() != null ? session.getCourseGroup().getId() : null)
                .courseGroupName(session.getCourseGroup() != null ? session.getCourseGroup().getName() : null)
                .courseSubgroupId(session.getCourseSubgroup() != null ? session.getCourseSubgroup().getId() : null)
                .courseSubgroupName(session.getCourseSubgroup() != null ? session.getCourseSubgroup().getName() : null)
                .teacherId(teacher.getId())
                .teacherName(teacher.getEmri() + " " + teacher.getMbiemri())
                .sessionType(session.getSessionType())
                .dayOfWeek(session.getDayOfWeek())
                .startTime(session.getStartTime())
                .endTime(session.getEndTime())
                .room(session.getRoom())
                .capacity(session.getCapacity())
                .status(session.getStatus())
                .build();
    }
}
