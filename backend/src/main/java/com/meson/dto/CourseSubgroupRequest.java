package com.meson.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseSubgroupRequest {
    @NotBlank(message = "Emri i nengrupit nuk mund te jete bosh")
    private String name;
    private Integer capacity;
    private String schedule;
    private List<Long> assistantIds;
}
