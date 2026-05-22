package com.meson.dto;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AvailableDirectionGroupResponse {
    private DirectionGroupResponse group;
    private List<ScheduleSessionResponse> schedules;
    private boolean canApply;
    private String applyBlockedReason;
}
