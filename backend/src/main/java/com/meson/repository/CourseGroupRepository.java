package com.meson.repository;

import com.meson.entity.CourseGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CourseGroupRepository extends JpaRepository<CourseGroup, Long> {
    List<CourseGroup> findByCourseId(Long courseId);
    boolean existsByCourseIdAndNameIgnoreCase(Long courseId, String name);
}
