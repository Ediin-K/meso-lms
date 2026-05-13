package com.meson.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Builder;
import jakarta.validation.constraints.NotNull;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AssignTeacherRequest {
    @NotNull(message = "courseId nuk mund të jetë null")
    private Long courseId;

    @NotNull(message = "teacherId nuk mund të jetë null")
    private Long teacherId;
}
