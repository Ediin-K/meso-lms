package com.meson.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Builder;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class TeacherResponse {
    private Long id;
    private String emri;
    private String mbiemri;
    private String email;
    private String phoneNumber;
    private String statusi;
    private LocalDateTime dataKrijimit;
    private Integer courseCount;
}
