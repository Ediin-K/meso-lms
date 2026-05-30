 package com.meson.dto;

import com.meson.entity.CourseLevel;
import com.meson.entity.CourseStatus;
import java.time.LocalDateTime;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseResponse {
    private Long id;
    private String titulli;
    private String pershkrimi;
    private Long teacherId;
    private String teacherName;
    private Long categoryId;
    private Integer semester;
    private String enrollmentKey;
    private String categoryName;
    private Double cmimi;
    private Integer ects;
    private CourseLevel niveli;
    private CourseStatus statusi;
    private Integer moduleCount;
    private Integer studentCount;
    private LocalDateTime createdAt;
}