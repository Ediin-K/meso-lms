package com.meson.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizAttemptRequest {

    @NotNull(message = "QuizId nuk mund te jet bosh")
    private Long quizId;

    @NotNull(message = "UserId nuk mund te jet bosh")
    private Long userId;

    @NotNull(message = "Piketet nuk mund te jet bosh")
    @DecimalMin(value = "0.0")
    private Double pikete;

    @NotNull(message = "Koha nuk mund te jet bosh")
    @Min(value = 0)
    private Integer kohaSekondat;
}
