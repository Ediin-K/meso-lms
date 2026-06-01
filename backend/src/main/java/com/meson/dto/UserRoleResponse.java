package com.meson.dto;

import lombok.Data;

@Data
public class UserRoleResponse{
    private Long id;
    private String emri;
    private String mbiemri;
    private String email;
    private String role;
}
