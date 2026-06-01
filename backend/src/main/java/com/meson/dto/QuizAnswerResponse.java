package com.meson.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizAnswerResponse {
    private Long id;
    private String pergjigja;
    private Boolean eshteSakte;
    private Long questionId;
}
