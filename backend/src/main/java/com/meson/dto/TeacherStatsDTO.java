package com.meson.dto;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class TeacherStatsDTO {
    private long totalCourses;
    private long totalStudents;
    private long totalQuizzes;
    private long totalAssignments;
}
