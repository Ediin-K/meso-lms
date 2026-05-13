package com.meson.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Builder;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CreateTeacherRequest {
    @NotBlank(message = "Emri nuk mund të jetë bosh")
    private String emri;

    @NotBlank(message = "Mbiemri nuk mund të jetë bosh")
    private String mbiemri;

    @Email(message = "Email duhet të jetë valid")
    @NotBlank(message = "Email nuk mund të jetë bosh")
    private String email;

    @NotBlank(message = "Fjalëkalimi nuk mund të jetë bosh")
    private String password;

    private String phoneNumber;

    @Builder.Default
    private String statusi = "active";
}
