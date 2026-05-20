package com.meson.repository;

import com.meson.entity.CourseGroupTeacher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CourseGroupTeacherRepository extends JpaRepository<CourseGroupTeacher, Long> {
    List<CourseGroupTeacher> findByCourseGroupId(Long courseGroupId);
    void deleteByCourseGroupId(Long courseGroupId);
}
