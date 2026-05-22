package com.meson.dto;

import com.meson.entity.GroupRequestStatus;
import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentGroupRequestResponse {
    private Long id;
    private Long studentId;
    private String studentFirstName;
    private String studentLastName;
    private String studentEmail;
    private Long categoryId;
    private String categoryName;
    private Long directionGroupId;
    private String directionGroupName;
    private GroupRequestStatus status;
    private LocalDateTime appliedAt;
    private LocalDateTime approvedAt;
    private Long approvedById;
    private String approvedByName;
}
