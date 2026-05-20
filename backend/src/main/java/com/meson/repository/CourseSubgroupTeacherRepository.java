package com.meson.repository;

import com.meson.entity.CourseSubgroupTeacher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CourseSubgroupTeacherRepository extends JpaRepository<CourseSubgroupTeacher, Long> {
    List<CourseSubgroupTeacher> findByCourseSubgroupId(Long courseSubgroupId);
    void deleteByCourseSubgroupId(Long courseSubgroupId);
}
