package com.meson.repository;

import com.meson.entity.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface QuizRepository extends JpaRepository<Quiz, Long> {
    List<Quiz> findByLessonId(Long lessonId);
    List<Quiz> findByPublikuarTrue();
    List<Quiz> findByLessonIdAndPublikuarTrue(Long lessonId);
    boolean existsByTitulliAndLessonId(String titulli, Long lessonId);

    Optional<Quiz> findByIdAndLessonModuleCourseTeacherId(Long id, Long teacherId);
    long countByLessonModuleCourseTeacherId(Long teacherId);
}
