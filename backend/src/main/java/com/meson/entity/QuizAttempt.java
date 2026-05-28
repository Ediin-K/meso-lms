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

    @Column(nullable = false)
    private Double pikete;

    @Column(nullable = false)
    private Integer kohaSekondat;

    @Column(nullable = false, updatable = false)
    private LocalDateTime startedAt;

    @Column(nullable = false)
    private LocalDateTime expiresAt;

    private LocalDateTime submittedAt;

    @Builder.Default
    @Column(nullable = false)
    private Boolean submitted = false;

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
}
