package com.meson.dto;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseSubgroupResponse {
    private Long id;
    private Long courseGroupId;
    private String name;
    private Integer capacity;
    private String schedule;
    private List<AssignedTeacherResponse> assistants;
}
