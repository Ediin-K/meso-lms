package com.meson.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssignStudentGroupRequest {
    @NotNull
    private Long directionGroupId;
}
