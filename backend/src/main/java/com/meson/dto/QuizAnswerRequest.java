package com.meson.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizAnswerRequest {

    @NotBlank(message = "Pergjigja nuk mund te jet bosh")
    private String pergjigja;

    @NotNull(message = "EshteSakte nuk mund te jet bosh")
    private Boolean eshteSakte;

    @NotNull(message = "QuestionId nuk mund te jet bosh")
    private Long questionId;
}
