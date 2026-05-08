package com.meson.dto;

import lombok.*;

@Data
@AllArgsConstructor
public class AdminStatsDTO {
    private long totalUsers;
    private long totalCourses;
    private long totalEnrollments;
}
