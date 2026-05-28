package com.meson.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizSubmitRequest {

    @NotNull(message = "AttemptId nuk mund te jet bosh")
    private Long attemptId;

    @Valid
    private List<QuestionSubmissionRequest> answers;
}
