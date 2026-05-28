package com.meson.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuestionSubmissionRequest {

    @NotNull(message = "QuestionId nuk mund te jet bosh")
    private Long questionId;

    private List<Long> answerIds;
}
