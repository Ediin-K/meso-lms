package com.meson.dto;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DirectionGroupWizardResponse {
    private DirectionGroupResponse group;
    private List<CourseGroupResponse> courseGroups;
    private List<ScheduleSessionResponse> schedules;
}
