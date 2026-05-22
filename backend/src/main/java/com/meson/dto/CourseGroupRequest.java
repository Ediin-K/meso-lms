package com.meson.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseGroupRequest {
    @NotBlank(message = "Emri i grupit nuk mund te jete bosh")
    private String name;
    private Integer capacity;
    private String schedule;
    private Long directionGroupId;
    private List<Long> teacherIds;
}
