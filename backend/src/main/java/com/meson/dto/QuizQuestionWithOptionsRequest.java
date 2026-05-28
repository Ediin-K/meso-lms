package com.meson.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizQuestionWithOptionsRequest {

    @NotBlank(message = "Pyetja nuk mund te jet bosh")
    private String pyetja;

    @Valid
    @NotEmpty(message = "Pyetja duhet te kete alternativa")
    private List<QuizOptionRequest> options;
}
