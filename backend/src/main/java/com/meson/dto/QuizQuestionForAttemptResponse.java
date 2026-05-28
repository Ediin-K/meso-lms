package com.meson.dto;

import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizQuestionForAttemptResponse {
    private Long id;
    private String pyetja;
    private Integer rradhitja;
    private List<QuizAnswerStudentResponse> answers;
}
