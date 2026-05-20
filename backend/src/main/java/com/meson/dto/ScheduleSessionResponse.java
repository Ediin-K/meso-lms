package com.meson.dto;

import com.meson.entity.ScheduleSessionType;
import lombok.*;
import java.time.DayOfWeek;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScheduleSessionResponse {
    private Long id;
    private Long courseId;
    private String courseTitle;
    private Long categoryId;
    private String categoryName;
    private Integer semester;
    private Long courseGroupId;
    private String courseGroupName;
    private Long courseSubgroupId;
    private String courseSubgroupName;
    private Long teacherId;
    private String teacherName;
    private ScheduleSessionType sessionType;
    private DayOfWeek dayOfWeek;
    private LocalTime startTime;
    private LocalTime endTime;
    private String room;
    private Integer capacity;
    private String status;
}
