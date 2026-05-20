package com.meson.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class UserDTO {
    private Long id;
    private String emri;
    private String mbiemri;
    private String email;
    private String statusi;
    private String role;
    private Long categoryId;
    private String categoryName;
    private Integer currentSemester;
    private LocalDateTime joined;
}
