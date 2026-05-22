package com.meson.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentGroupMemberResponse {
    private Long userId;
    private String firstName;
    private String lastName;
    private String email;
    private Integer currentSemester;
}
