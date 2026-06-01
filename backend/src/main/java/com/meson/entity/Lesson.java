package com.meson.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "lessons")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(exclude = {"module"})
public class Lesson {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String titulli;

    @Column(columnDefinition = "TEXT")
    private String permbajtja;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private LessonType lloji = LessonType.TEKST;

    private String videoUrl;

    private String resourceUrl;

    @Column(nullable = false)
    private Integer rradhitja;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "module_id", nullable = false)
    private Module module;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
