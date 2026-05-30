package com.meson.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "quiz_attempts")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(exclude = {"quiz", "user", "submissions"})
public class QuizAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id", nullable = false)
    private Quiz quiz;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Builder.Default
    @Column(nullable = false)
    private Double pikete = 0.0;

    @Builder.Default
    @Column(nullable = false)
    private Integer kohaSekondat = 0;

    @Column(nullable = false, updatable = false)
    private LocalDateTime startedAt;

    @Column(nullable = false)
    private LocalDateTime expiresAt;

    private LocalDateTime submittedAt;

    @Builder.Default
    @Column(nullable = false)
    private Boolean submitted = false;

    @Builder.Default
    @Column(nullable = false)
    private Boolean abandoned = false;

    private LocalDateTime abandonedAt;

    @Builder.Default
    @OneToMany(mappedBy = "attempt", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AnswerSubmission> submissions = new ArrayList<>();

    @Column(nullable = false, updatable = false)
    private LocalDateTime data;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        if (this.startedAt == null) {
            this.startedAt = now;
        }
        if (this.data == null) {
            this.data = now;
        }
    }

    public String getAttemptStatus() {
        if (Boolean.TRUE.equals(this.abandoned)) return "ABANDONED";
        if (Boolean.TRUE.equals(this.submitted)) return "SUBMITTED";
        if (this.expiresAt != null && LocalDateTime.now().isAfter(this.expiresAt)) return "TIMED_OUT";
        return "IN_PROGRESS";
    }
}
