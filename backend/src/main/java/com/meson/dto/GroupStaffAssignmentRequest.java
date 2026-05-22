package com.meson.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GroupStaffAssignmentRequest {
    @NotNull
    private Long courseId;
    @NotNull
    private Long professorId;
    private Long assistantId;
}
