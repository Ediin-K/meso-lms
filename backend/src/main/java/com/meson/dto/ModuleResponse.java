package com.meson.dto;

import java.time.LocalDateTime;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ModuleResponse{

    private Long id;
    private String titulli;
    private String pershkrimi;
    private Integer rradhitja;
    private LocalDateTime createdAt;
    private Long courseId;
    private String courseTitulli;
    private Integer lessonCount;
}