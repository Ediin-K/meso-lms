package com.meson.dto;

import com.meson.entity.QuizType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizQuestionWithOptionsRequest {

    @NotBlank(message = "Pyetja nuk mund te jet bosh")
    private String pyetja;

    @NotNull(message = "Lloji i pyetjes nuk mund te jet bosh")
    private QuizType lloji;

    @NotNull(message = "Piket nuk mund te jen bosh")
    @Min(value = 1, message = "Piket duhet te jene te pakten 1")
    private Integer pikete;

    @Valid
    @NotEmpty(message = "Pyetja duhet te kete alternativa")
    private List<QuizOptionRequest> options;
}
