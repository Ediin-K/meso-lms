package com.meson.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizSubmitResponse {
    private Long attemptId;
    private Boolean submitted;
    private String message;
    private Double pikete;
    private Long courseId;
}
