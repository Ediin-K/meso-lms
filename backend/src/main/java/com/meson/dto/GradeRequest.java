package com.meson.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GradeRequest {

    @NotNull(message = "studentId eshte i detyrueshem")
    private Long studentId;

    @NotNull(message = "courseId eshte i detyrueshem")
    private Long courseId;

    @NotNull(message = "Nota eshte e detyrueshme")
    @Min(value = 5, message = "Nota duhet te jete nga 5 deri ne 10")
    @Max(value = 10, message = "Nota duhet te jete nga 5 deri ne 10")
    private Integer grade;

    private String comment;
}
