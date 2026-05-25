package com.meson.dto;

import com.meson.entity.DirectionGroupStatus;
import jakarta.validation.constraints.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DirectionGroupRequest {
    @NotNull
    @Min(1)
    @Max(12)
    private Integer semester;

    @NotBlank
    private String name;

    private String description;

    @NotNull
    @Min(1)
    private Integer maxCapacity;

    private DirectionGroupStatus status;
}
