package com.meson.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LessonResourceResponse {
    private Long id;
    private String emriOrigjinal;
    private String tipi;
    private Long madhesia;
    private String resourceType;
    private Boolean previewable;
    private String url;
    private String viewUrl;
    private String downloadUrl;
    private LocalDateTime createdAt;
}
