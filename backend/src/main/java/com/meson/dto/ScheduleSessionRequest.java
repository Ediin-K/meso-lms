package com.meson.dto;

import com.meson.entity.ScheduleSessionType;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.DayOfWeek;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScheduleSessionRequest {
    @NotNull
    private Long courseId;
    private Long courseGroupId;
    private Long courseSubgroupId;
    @NotNull
    private Long teacherId;
    @NotNull
    private ScheduleSessionType sessionType;
    @NotNull
    private DayOfWeek dayOfWeek;
    @NotNull
    private LocalTime startTime;
    private LocalTime endTime;
    private String room;
    @Builder.Default
    @Min(1)
    private Integer capacity = 30;
}
