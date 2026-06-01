package com.meson.dto;

import lombok.Data;

@Data
public class UserRoleRequest{
    private Long userId;
    private Long roleId;
}
