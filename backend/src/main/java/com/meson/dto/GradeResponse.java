package com.meson.dto;

import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GradeResponse {
    private Long id;
    private Long studentId;
    private String studentEmri;
    private String studentMbiemri;
    private Long courseId;
    private String courseTitulli;
    private Long professorId;
    private String professorEmri;
    private Integer grade;
    private String comment;
    private LocalDateTime assignedAt;
}
