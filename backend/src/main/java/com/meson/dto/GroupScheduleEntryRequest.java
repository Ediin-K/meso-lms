package com.meson.dto;

import com.meson.entity.ScheduleSessionType;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.time.DayOfWeek;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GroupScheduleEntryRequest {
    @NotNull
    private Long courseId;
    @NotNull
    private Long professorId;
    private Long assistantId;
    @NotNull
    private ScheduleSessionType sessionType;
    @NotNull
    private DayOfWeek dayOfWeek;
    @NotNull
    private LocalTime startTime;
    private LocalTime endTime;
    private String room;
}
