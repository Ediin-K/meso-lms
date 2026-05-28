package com.meson.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizAttemptResponse {
    private Long id;
    private Long quizId;
    private String quizTitulli;
    private Long userId;
    private String userEmri;
    private Double pikete;
    private Integer kohaSekondat;
    private LocalDateTime data;
    private LocalDateTime startedAt;
    private LocalDateTime expiresAt;
    private LocalDateTime submittedAt;
    private Boolean submitted;
}
