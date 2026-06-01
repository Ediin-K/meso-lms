package com.meson.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponse {
    @JsonIgnore
    private String token;
    private String email;
    private String role;
    @JsonIgnore
    private String refreshToken;
    private Long userId;
}
