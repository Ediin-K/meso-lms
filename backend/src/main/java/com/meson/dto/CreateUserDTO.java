package com.meson.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateUserDTO {
    private String emri;
    private String mbiemri;
    private String email;
    private String password;
    private String role;
    private String statusi;
    private Long categoryId;
    private Integer currentSemester;
}
