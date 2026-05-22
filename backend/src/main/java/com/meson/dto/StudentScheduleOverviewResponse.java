package com.meson.dto;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentScheduleOverviewResponse {
    private StudentGroupStatusResponse status;
    private List<AvailableDirectionGroupResponse> availableGroups;
    private List<ScheduleSessionResponse> approvedSchedules;
}
