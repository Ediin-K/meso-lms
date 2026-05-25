package com.meson.repository;

import com.meson.entity.LessonResource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface LessonResourceRepository extends JpaRepository<LessonResource, Long> {
    List<LessonResource> findByLessonId(Long lessonId);

    @Query("""
            SELECT r FROM LessonResource r
            JOIN FETCH r.lesson l
            JOIN FETCH l.module m
            JOIN FETCH m.course c
            LEFT JOIN FETCH c.teacher
            WHERE r.id = :id
            """)
    Optional<LessonResource> findByIdWithLessonCourse(@Param("id") Long id);
}
