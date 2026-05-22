package com.meson.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateDirectionGroupWizardRequest {
    @NotNull
    private Long categoryId;

    @NotNull
    @Min(1)
    @Max(12)
    private Integer semester;

    @NotBlank
    private String name;

    @NotNull
    @Min(1)
    private Integer maxCapacity;

    @Valid
    @NotEmpty
    private List<GroupStaffAssignmentRequest> staff;

    @Valid
    @NotEmpty
    private List<GroupScheduleEntryRequest> schedules;
}
