package com.meson.dto;

import com.meson.entity.QuizType;
import jakarta.validation.constraints.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizQuestionRequest {

    @NotBlank(message = "Pyetja nuk mund te jet bosh")
    private String pyetja;

    @NotNull(message = "Lloji nuk mund te jet bosh")
    private QuizType lloji;

    @NotNull(message = "Rradhitja nuk mund te jet bosh")
    @Min(value = 1)
    private Integer rradhitja;

    @NotNull(message = "Piket nuk mund te jen bosh")
    @Min(value = 1)
    private Integer pikete;

    @NotNull(message = "QuizId nuk mund te jet bosh")
    private Long quizId;
}
