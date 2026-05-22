package com.meson.dto;

import com.meson.entity.GroupRequestStatus;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentGroupStatusResponse {
    private boolean hasApprovedGroup;
    private boolean categoryAssigned;
    private Long categoryId;
    private String categoryName;
    private Integer currentSemester;
    private DirectionGroupResponse approvedGroup;
    private StudentGroupRequestResponse pendingRequest;
}
