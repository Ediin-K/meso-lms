package com.meson.dto;

import com.meson.entity.CourseLevel;
import com.meson.entity.CourseStatus;
import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseRequest {

    @NotBlank(message="Titulli nuk mund te jet bosh")
    private String titulli;

    @Size(max = 500, message = "Pershkrimi nuk mund te kaloj 500 karaktere")
    private String pershkrimi;

    @NotNull
    private Long teacherId;

    @NotNull
    private Long categoryId;

    @NotNull
    private Integer semester;

    private String enrollmentKey;

    @Builder.Default
    @DecimalMin(value = "0.0", message = "Cmimi nuk mund te jet negativ")
    private Double cmimi = 0.0;

    @NotNull
    @Min(value = 1, message = "ECTS duhet te jete te pakten 1")
    @Max(value = 30, message = "ECTS nuk mund te kaloj 30")
    @Builder.Default
    private Integer ects = 5;

    @Builder.Default
    private CourseLevel niveli = CourseLevel.FILLESTAR;

    @Builder.Default
    private CourseStatus statusi= CourseStatus.DRAFT;





}