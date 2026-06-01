package com.meson.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CertificateResponse {
    private Long id;
    private Long enrollmentId;
    private Long userId;
    private String userEmri;
    private Long courseId;
    private String courseTitulli;
    private String kodiUnik;
    private LocalDateTime dataLeshimit;
}
