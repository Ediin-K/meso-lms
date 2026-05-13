package com.meson.repository;

import com.meson.entity.Assignment;
import com.meson.entity.AssignmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface AssignmentRepository extends JpaRepository<Assignment, Long> {
    List<Assignment> findByLessonId(Long lessonId);
    List<Assignment> findByLessonIdAndStatusi(Long lessonId, AssignmentStatus statusi);
    boolean existsByTitulliAndLessonId(String titulli, Long lessonId);

    Optional<Assignment> findByIdAndLessonModuleCourseTeacherId(Long id, Long teacherId);
    long countByLessonModuleCourseTeacherId(Long teacherId);
}