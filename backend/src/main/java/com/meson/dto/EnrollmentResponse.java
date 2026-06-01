
package com.meson.dto;

import com.meson.entity.EnrollmentStatus;
import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EnrollmentResponse {
    private Long id;
    private Long userId;
    private String userEmri;
    private Long courseId;
    private String courseTitulli;
    private Integer courseEcts;
    private Long courseGroupId;
    private String courseGroupName;
    private Long courseSubgroupId;
    private String courseSubgroupName;
    private String professorName;
    private String assistantName;
    private Double progresi;
    private EnrollmentStatus statusi;
    private LocalDateTime dataRegjistrimit;
}
