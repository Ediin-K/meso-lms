package com.meson.repository;

import com.meson.entity.Grade;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GradeRepository extends JpaRepository<Grade, Long> {

    @EntityGraph(attributePaths = {"student", "course", "professor"})
    List<Grade> findByStudentId(Long studentId);

    @EntityGraph(attributePaths = {"student", "course", "professor"})
    List<Grade> findByCourseId(Long courseId);

    @EntityGraph(attributePaths = {"student", "course", "professor"})
    Optional<Grade> findByIdAndCourseTeacherId(Long id, Long teacherId);

    @EntityGraph(attributePaths = {"student", "course", "professor"})
    List<Grade> findByCourseTeacherId(Long teacherId);

    boolean existsByStudentIdAndCourseId(Long studentId, Long courseId);

    Optional<Grade> findByStudentIdAndCourseId(Long studentId, Long courseId);
}
