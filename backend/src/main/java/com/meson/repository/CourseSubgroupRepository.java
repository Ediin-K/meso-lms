package com.meson.repository;

import com.meson.entity.CourseSubgroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CourseSubgroupRepository extends JpaRepository<CourseSubgroup, Long> {
    List<CourseSubgroup> findByCourseGroupId(Long courseGroupId);
    boolean existsByCourseGroupIdAndNameIgnoreCase(Long courseGroupId, String name);
}
