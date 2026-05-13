package com.meson.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Builder;
import jakarta.validation.constraints.Email;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UpdateTeacherRequest {
    private String emri;
    private String mbiemri;

    @Email(message = "Email duhet të jetë valid")
    private String email;

    private String phoneNumber;
    private String password;
    private String statusi;
}
