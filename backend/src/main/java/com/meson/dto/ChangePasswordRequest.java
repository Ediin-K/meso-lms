package com.meson.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChangePasswordRequest {
    @NotBlank(message = "Fjalëkalimi aktual eshte i detyrueshem")
    private String currentPassword;

    @NotBlank(message = "Fjalëkalimi i ri eshte i detyrueshem")
    @Size(min = 8, message = "Fjalëkalimi i ri duhet te kete te pakten 8 karaktere")
    private String newPassword;
}
