package com.meson.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizOptionRequest {

    @NotBlank(message = "Alternativa nuk mund te jet bosh")
    private String pergjigja;

    @NotNull(message = "Duhet percaktuar nese alternativa eshte e sakte")
    private Boolean eshteSakte;
}
