package com.meson.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizAnswerStudentResponse {
    private Long id;
    private String pergjigja;
    private Long questionId;
    
}
