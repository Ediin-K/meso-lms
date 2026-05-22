package com.meson.repository;

import com.meson.entity.CourseGroup;
import com.meson.entity.DirectionGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CourseGroupRepository extends JpaRepository<CourseGroup, Long> {
    List<CourseGroup> findByCourseId(Long courseId);
    List<CourseGroup> findByDirectionGroupId(Long directionGroupId);
    boolean existsByCourseIdAndNameIgnoreCase(Long courseId, String name);

    @Query("""
            SELECT DISTINCT cg.directionGroup FROM CourseGroup cg
            WHERE cg.course.courseCategory.id = :categoryId
              AND cg.directionGroup IS NOT NULL
            ORDER BY cg.directionGroup.name ASC
            """)
    List<DirectionGroup> findDistinctDirectionGroupsByCategoryId(@Param("categoryId") Long categoryId);
}
