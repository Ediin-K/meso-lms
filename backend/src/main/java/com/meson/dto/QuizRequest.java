package com.meson.dto;

import jakarta.validation.constraints.*;
import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizRequest {

    @NotBlank(message = "Titulli nuk mund te jet bosh")
    private String titulli;

    private String pershkrimi;

    @NotNull(message = "Kohezgjatja nuk mund te jet bosh")
    @Min(value = 1, message = "Kohezgjatja duhet te jet me e madhe se 0")
    private Integer kohezgjatjaMinuta;

    @NotNull(message = "LessonId nuk mund te jet bosh")
    private Long lessonId;

    private Boolean publikuar;

    private List<QuizQuestionWithOptionsRequest> questions;
}
