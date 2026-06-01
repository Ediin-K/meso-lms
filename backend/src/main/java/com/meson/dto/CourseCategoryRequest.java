package com.meson.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CourseCategoryRequest {

    @NotBlank(message="Emertimi nuk mund te jet bosh")
    @Size(min = 2, max = 100, message = "Emertimi duhet te jet 2-100 karaktere")
    private String emertimi;

    @Size(max = 500, message = "Pershkrimi nuk mund te kaloj 500 karaktere")
    private String pershkrimi;

}
