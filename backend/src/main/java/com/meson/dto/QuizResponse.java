package com.meson.dto;

import com.meson.entity.QuizStatus;
import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizResponse {
    private Long id;
    private String titulli;
    private String pershkrimi;
    private Integer kohezgjatjaMinuta;
    private QuizStatus status;
    private Boolean publikuar;
    private Long lessonId;
    private String lessonTitulli;
    private LocalDateTime createdAt;
    private LocalDateTime activatedAt;
    private LocalDateTime closedAt;
}
