package com.meson.repository;

import com.meson.entity.AnswerSubmission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnswerSubmissionRepository extends JpaRepository<AnswerSubmission, Long> {
    List<AnswerSubmission> findByAttemptId(Long attemptId);
    void deleteByAttemptId(Long attemptId);
}
