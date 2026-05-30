package com.meson.dto;

import com.meson.entity.QuizType;
import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizQuestionResponse {
    private Long id;
    private String pyetja;
    private QuizType lloji;
    private Integer rradhitja;
    private Integer pikete;
    private Long quizId;
    private List<QuizAnswerResponse> options;
}