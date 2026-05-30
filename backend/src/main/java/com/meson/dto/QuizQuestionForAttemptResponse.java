package com.meson.dto;

import com.meson.entity.QuizType;
import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizQuestionForAttemptResponse {
    private Long id;
    private String pyetja;
    private QuizType lloji;
    private Integer rradhitja;
    private Integer pikete;
    private List<QuizAnswerStudentResponse> answers;
}
