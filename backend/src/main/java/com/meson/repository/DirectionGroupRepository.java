package com.meson.repository;

import com.meson.entity.DirectionGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface DirectionGroupRepository extends JpaRepository<DirectionGroup, Long> {
    List<DirectionGroup> findByCourseCategoryIdOrderByNameAsc(Long categoryId);

    List<DirectionGroup> findByCourseCategoryIdAndSemesterOrderByNameAsc(Long categoryId, Integer semester);

    Optional<DirectionGroup> findByCourseCategoryIdAndSemesterAndNameIgnoreCase(
            Long categoryId, Integer semester, String name);

    boolean existsByCourseCategoryIdAndSemesterAndNameIgnoreCase(
            Long categoryId, Integer semester, String name);

    @Query("""
            SELECT dg FROM DirectionGroup dg
            JOIN FETCH dg.courseCategory
            WHERE dg.id = :id
            """)
    java.util.Optional<DirectionGroup> findByIdWithCategory(@Param("id") Long id);

    @Query("""
            SELECT dg FROM DirectionGroup dg
            JOIN FETCH dg.courseCategory
            WHERE dg.courseCategory.id = :categoryId
            ORDER BY dg.name ASC
            """)
    List<DirectionGroup> findByCategoryIdWithCategory(@Param("categoryId") Long categoryId);

    @Query("""
            SELECT dg FROM DirectionGroup dg
            JOIN FETCH dg.courseCategory
            WHERE dg.courseCategory.id = :categoryId AND dg.semester = :semester
            ORDER BY dg.name ASC
            """)
    List<DirectionGroup> findByCategoryIdAndSemesterWithCategory(
            @Param("categoryId") Long categoryId,
            @Param("semester") Integer semester);
}
