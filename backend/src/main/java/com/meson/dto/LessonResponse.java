package com.meson.dto;

import com.meson.entity.LessonType;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LessonResponse {
    private Long id;
    private String titulli;
    private String permbajtja;
    private LessonType lloji;
    private String videoUrl;
    private String resourceUrl;
    private Integer rradhitja;
    private Long moduleId;
    private String moduleTitulli;
    private LocalDateTime createdAt;
    private List<LessonResourceResponse> resources;
}
