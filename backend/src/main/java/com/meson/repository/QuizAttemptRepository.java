package com.meson.repository;

import com.meson.entity.QuizAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, Long> {
    List<QuizAttempt> findByQuizId(Long quizId);
    List<QuizAttempt> findByUserId(Long userId);
    List<QuizAttempt> findByQuizIdAndUserId(Long quizId, Long userId);
    Optional<QuizAttempt> findFirstByQuizIdAndUserId(Long quizId, Long userId);
    List<QuizAttempt> findByQuizIdOrderBySubmittedAtDesc(Long quizId);
}
