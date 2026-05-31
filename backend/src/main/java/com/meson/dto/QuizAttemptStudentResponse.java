package com.meson.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizAttemptStudentResponse {
    private Long id;
    private Long quizId;
    private String quizTitulli;
    private LocalDateTime startedAt;
    private LocalDateTime expiresAt;
    private LocalDateTime submittedAt;
    private Boolean submitted;
    private String attemptStatus;
    /** Pikët shfaqen vetëm për tentativa të dorëzuara. */
    private Double pikete;
}
