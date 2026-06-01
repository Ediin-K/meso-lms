package com.meson.repository;

import com.meson.entity.QuizQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface QuizQuestionRepository extends JpaRepository<QuizQuestion, Long> {
    List<QuizQuestion> findByQuizIdOrderByRradhitjaAsc(Long quizId);
    void deleteAllByQuizId(Long quizId);
    long countByQuizId(Long quizId);
}
