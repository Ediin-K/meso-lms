package com.meson.service;

import com.meson.entity.ScheduleSession;
import com.meson.exception.BadRequestException;
import com.meson.repository.ScheduleSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.List;
import java.util.Objects;

@Component
@RequiredArgsConstructor
public class ScheduleConflictValidator {

    private final ScheduleSessionRepository scheduleSessionRepository;

    public void validateSlot(
            Long courseGroupId,
            Long professorId,
            Long assistantId,
            DayOfWeek dayOfWeek,
            LocalTime startTime,
            LocalTime endTime,
            List<ScheduleSession> batchPending,
            Long excludeSessionId) {

        if (startTime == null || endTime == null) {
            throw new BadRequestException("Ora e fillimit dhe mbarimit jane te detyrueshme");
        }
        if (!endTime.isAfter(startTime)) {
            throw new BadRequestException("Ora e perfundimit duhet te jete pas ores se fillimit");
        }

        if (courseGroupId != null) {
            assertNoGroupConflict(courseGroupId, dayOfWeek, startTime, endTime, batchPending, excludeSessionId);
        }

        if (professorId != null) {
            assertNoTeacherConflict(
                    professorId,
                    dayOfWeek,
                    startTime,
                    endTime,
                    batchPending,
                    excludeSessionId,
                    "Professor already has a class at this time");
        }

        if (assistantId != null) {
            assertNoTeacherConflict(
                    assistantId,
                    dayOfWeek,
                    startTime,
                    endTime,
                    batchPending,
                    excludeSessionId,
                    "Assistant already has a class at this time");
        }
    }

    public void validateSession(ScheduleSession candidate, List<ScheduleSession> batchPending, Long excludeSessionId) {
        requireValidCandidate(candidate);
        Long assistantId = null;
        validateSlot(
                candidate.getCourseGroup() != null ? candidate.getCourseGroup().getId() : null,
                candidate.getTeacher().getId(),
                assistantId,
                candidate.getDayOfWeek(),
                candidate.getStartTime(),
                candidate.getEndTime(),
                batchPending,
                excludeSessionId);
    }

    public void validateSessionWithAssistant(
            ScheduleSession candidate,
            Long assistantId,
            List<ScheduleSession> batchPending,
            Long excludeSessionId) {
        requireValidCandidate(candidate);
        validateSlot(
                candidate.getCourseGroup() != null ? candidate.getCourseGroup().getId() : null,
                candidate.getTeacher().getId(),
                assistantId,
                candidate.getDayOfWeek(),
                candidate.getStartTime(),
                candidate.getEndTime(),
                batchPending,
                excludeSessionId);
    }

    private void assertNoGroupConflict(
            Long courseGroupId,
            DayOfWeek day,
            LocalTime start,
            LocalTime end,
            List<ScheduleSession> batchPending,
            Long excludeSessionId) {

        for (ScheduleSession existing : scheduleSessionRepository.findOverlappingForCourseGroup(
                courseGroupId, day, start, end)) {
            if (excludeSessionId != null && existing.getId().equals(excludeSessionId)) {
                continue;
            }
            throw new BadRequestException("Ky grup ka tashme nje ore ne kete interval kohor");
        }

        for (ScheduleSession pending : batchPending) {
            if (pending.getCourseGroup() == null
                    || !pending.getCourseGroup().getId().equals(courseGroupId)) {
                continue;
            }
            if (pending.getDayOfWeek() != day) {
                continue;
            }
            if (timesOverlap(pending.getStartTime(), pending.getEndTime(), start, end)) {
                throw new BadRequestException("Ky grup ka tashme nje ore ne kete interval kohor");
            }
        }
    }

    private void assertNoTeacherConflict(
            Long teacherId,
            DayOfWeek day,
            LocalTime start,
            LocalTime end,
            List<ScheduleSession> batchPending,
            Long excludeSessionId,
            String message) {

        for (ScheduleSession existing : scheduleSessionRepository.findOverlappingForTeacher(
                teacherId, day, start, end)) {
            if (excludeSessionId != null && existing.getId().equals(excludeSessionId)) {
                continue;
            }
            throw new BadRequestException(message);
        }

        for (ScheduleSession pending : batchPending) {
            if (pending.getTeacher() == null || !Objects.equals(pending.getTeacher().getId(), teacherId)) {
                continue;
            }
            if (pending.getDayOfWeek() != day) {
                continue;
            }
            if (timesOverlap(pending.getStartTime(), pending.getEndTime(), start, end)) {
                throw new BadRequestException(message);
            }
        }
    }

    private boolean timesOverlap(LocalTime startA, LocalTime endA, LocalTime startB, LocalTime endB) {
        return startA.isBefore(endB) && startB.isBefore(endA);
    }

    private void requireValidCandidate(ScheduleSession candidate) {
        if (candidate == null
                || candidate.getTeacher() == null
                || candidate.getDayOfWeek() == null
                || candidate.getStartTime() == null
                || candidate.getEndTime() == null) {
            throw new BadRequestException("Orari nuk eshte i plote: mesuesi, dita dhe oret jane te detyrueshme");
        }
    }
}
