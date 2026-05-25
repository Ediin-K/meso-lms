package com.meson.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DirectionGroupResponse {
    private Long id;
    private Long categoryId;
    private String categoryName;
    private Integer semester;
    private String name;
    private String description;
    private Integer maxCapacity;
    private Integer currentStudents;
    private Integer remainingSeats;
    private Boolean isFull;
    /** ACTIVE, FULL (capacity reached), or CLOSED (admin closed enrollment). */
    private String status;
}
