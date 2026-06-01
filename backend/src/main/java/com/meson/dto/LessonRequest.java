package com.meson.dto;

import com.meson.entity.LessonType;
import jakarta.validation.constraints.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LessonRequest {

    @NotBlank(message = "Titulli nuk mund te jet bosh")
    private String titulli;

    private String permbajtja;

    @Builder.Default
    private LessonType lloji = LessonType.TEKST;

    private String videoUrl;

    private String resourceUrl;

    @NotNull(message = "Rradhitja nuk mund te jet bosh")
    @Min(value = 1, message = "Rradhitja duhet te jet me e madhe se 0")
    private Integer rradhitja;

    @NotNull(message = "Moduli nuk mund te jet bosh")
    private Long moduleId;
}
