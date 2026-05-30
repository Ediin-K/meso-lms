package com.meson.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateStudentProfileRequest {
    @NotBlank(message = "Emri eshte i detyrueshem")
    private String emri;

    @NotBlank(message = "Mbiemri eshte i detyrueshem")
    private String mbiemri;

    private String phoneNumber;
}
