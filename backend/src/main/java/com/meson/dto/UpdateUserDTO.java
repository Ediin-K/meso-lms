package com.meson.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateUserDTO {
    private String emri;
    private String mbiemri;
    private String email;
    private String phoneNumber;
    private String statusi;
    private String role;
    private String password;
}