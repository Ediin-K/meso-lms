package com.meson.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "quizzes")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(exclude = {"lesson", "questions", "attempts"})
public class Quiz {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String titulli;

    @Column(columnDefinition = "TEXT")
    private String pershkrimi;

    @Column(nullable = false)
    private Integer kohezgjatjaMinuta;

    @Builder.Default
    @Column(nullable = false)
    private Boolean publikuar = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lesson_id", nullable = false)
    private Lesson lesson;

    @Builder.Default
    @OneToMany(mappedBy = "quiz", fetch = FetchType.LAZY)
    private List<QuizQuestion> questions = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "quiz", fetch = FetchType.LAZY)
    private List<QuizAttempt> attempts = new ArrayList<>();

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
