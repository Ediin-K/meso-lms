package com.meson.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EnrollmentRequest {

    @NotNull(message = "UserId nuk mund te jet bosh")
    private Long userId;

    @NotNull(message = "CourseId nuk mund te jet bosh")
    private Long courseId;

    private Long courseGroupId;

    private Long courseSubgroupId;

    private String enrollmentKey;
}
