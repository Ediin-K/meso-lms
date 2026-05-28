package com.meson.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizStartResponse {
    private Long attemptId;
    private Long quizId;
    private String titulli;
    private String pershkrimi;
    private Integer kohezgjatjaMinuta;
    private LocalDateTime startedAt;
    private LocalDateTime expiresAt;
    private Integer remainingSeconds;
    private List<QuizQuestionForAttemptResponse> questions;
}
