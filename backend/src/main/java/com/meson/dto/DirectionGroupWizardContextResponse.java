package com.meson.dto;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DirectionGroupWizardContextResponse {
    private Long categoryId;
    private String categoryName;
    private Integer semester;
    private List<CourseResponse> courses;
    private List<TeacherResponse> teachers;
}
