package com.meson.dto;

import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentGradesSummaryResponse {
    private List<GradeResponse> grades;
    private Double averageGrade;
    private int totalGrades;
}
