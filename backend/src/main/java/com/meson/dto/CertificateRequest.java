package com.meson.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CertificateRequest {

    @NotNull(message = "EnrollmentId nuk mund te jet bosh")
    private Long enrollmentId;
}
