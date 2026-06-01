package com.meson.dto;

import com.meson.entity.Module;
import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ModuleRequest{

    @NotBlank(message = "Titulli nuk mund te jet bosh")
    private String titulli;

    @Size(max = 500, message = "Pershkrimi nuk mund te kaloj 500 karaktere")
    private String pershkrimi;

    @NotNull(message = "Kursi nuk mund te jet bosh")
    private Long courseId;

    @NotNull(message = "Rradhitja nuk mund te jet bosh")
    @Min(value = 1, message = "Rradhitja duhet te jet me e madhe se 0")
    private Integer rradhitja;
}
