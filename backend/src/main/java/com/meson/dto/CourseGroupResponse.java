package com.meson.dto;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseGroupResponse {
    private Long id;
    private Long courseId;
    private String name;
    private Integer capacity;
    private String schedule;
    private List<AssignedTeacherResponse> teachers;
    private List<CourseSubgroupResponse> subgroups;
}
