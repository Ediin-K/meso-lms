package com.meson.repository;

import com.meson.entity.ScheduleSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface ScheduleSessionRepository extends JpaRepository<ScheduleSession, Long> {
    List<ScheduleSession> findByCourseCourseCategoryIdAndCourseSemester(Long categoryId, Integer semester);
    List<ScheduleSession> findByCourseCourseCategoryIdAndCourseSemesterAndCourseGroupDirectionGroupId(
            Long categoryId, Integer semester, Long directionGroupId);
    List<ScheduleSession> findByCourseGroupDirectionGroupId(Long directionGroupId);

    @Query("""
            SELECT DISTINCT s FROM ScheduleSession s
            JOIN FETCH s.course c
            JOIN FETCH s.teacher
            LEFT JOIN FETCH s.courseGroup cg
            LEFT JOIN FETCH s.courseSubgroup
            WHERE cg.directionGroup.id = :directionGroupId
              AND c.semester = :semester
              AND s.status = 'ACTIVE'
            """)
    List<ScheduleSession> findByDirectionGroupIdAndSemester(
            @Param("directionGroupId") Long directionGroupId,
            @Param("semester") Integer semester);

    @Query("""
            SELECT DISTINCT s FROM ScheduleSession s
            JOIN FETCH s.course c
            JOIN FETCH s.teacher
            LEFT JOIN FETCH s.courseGroup cg
            LEFT JOIN FETCH s.courseSubgroup
            WHERE c.courseCategory.id = :categoryId
              AND c.semester = :semester
              AND cg.directionGroup.id = :directionGroupId
              AND s.status = 'ACTIVE'
            """)
    List<ScheduleSession> findApprovedSchedulesForStudent(
            @Param("categoryId") Long categoryId,
            @Param("semester") Integer semester,
            @Param("directionGroupId") Long directionGroupId);

    List<ScheduleSession> findByTeacherId(Long teacherId);
    List<ScheduleSession> findByDayOfWeek(DayOfWeek dayOfWeek);

    @Query("""
            SELECT DISTINCT s FROM ScheduleSession s
            JOIN FETCH s.course c
            LEFT JOIN FETCH c.courseCategory
            JOIN FETCH s.teacher
            LEFT JOIN FETCH s.courseGroup
            LEFT JOIN FETCH s.courseSubgroup
            """)
    List<ScheduleSession> findAllWithDetails();

    @Query("""
            SELECT DISTINCT s FROM ScheduleSession s
            JOIN FETCH s.course c
            LEFT JOIN FETCH c.courseCategory
            JOIN FETCH s.teacher
            LEFT JOIN FETCH s.courseGroup
            LEFT JOIN FETCH s.courseSubgroup
            WHERE s.teacher.id = :teacherId
            """)
    List<ScheduleSession> findByTeacherIdWithDetails(@Param("teacherId") Long teacherId);

    @Query("""
            SELECT s FROM ScheduleSession s
            WHERE s.teacher.id = :teacherId
              AND s.dayOfWeek = :day
              AND s.startTime < :endTime
              AND s.endTime > :startTime
              AND s.status = 'ACTIVE'
            """)
    List<ScheduleSession> findOverlappingForTeacher(
            @Param("teacherId") Long teacherId,
            @Param("day") DayOfWeek day,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime);

    @Query("""
            SELECT s FROM ScheduleSession s
            WHERE s.courseGroup.id = :courseGroupId
              AND s.dayOfWeek = :day
              AND s.startTime < :endTime
              AND s.endTime > :startTime
              AND s.status = 'ACTIVE'
            """)
    List<ScheduleSession> findOverlappingForCourseGroup(
            @Param("courseGroupId") Long courseGroupId,
            @Param("day") DayOfWeek day,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime);
}
