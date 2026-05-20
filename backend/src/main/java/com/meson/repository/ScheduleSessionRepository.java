package com.meson.repository;

import com.meson.entity.ScheduleSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.DayOfWeek;
import java.util.List;

@Repository
public interface ScheduleSessionRepository extends JpaRepository<ScheduleSession, Long> {
    List<ScheduleSession> findByCourseCourseCategoryIdAndCourseSemester(Long categoryId, Integer semester);
    List<ScheduleSession> findByTeacherId(Long teacherId);
    List<ScheduleSession> findByDayOfWeek(DayOfWeek dayOfWeek);
}
