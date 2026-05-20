package com.meson.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name="courses")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(exclude = {"teacher", "courseCategory", "enrollments", "groups"})
public class Course{

    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String titulli;

    @Column(nullable = false)
    private String pershkrimi;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "teacher_id", nullable = false)
    private User teacher;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private CourseCategory courseCategory;

    @Column(nullable=false)
    private Integer semester;

    @Column
    private String enrollmentKey;

    @Builder.Default
    private double cmimi = 0.0;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    private CourseLevel niveli = CourseLevel.FILLESTAR;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    private CourseStatus statusi= CourseStatus.DRAFT;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true)
    @com.fasterxml.jackson.annotation.JsonIgnore
    @ToString.Exclude
    private java.util.Set<Enrollment> enrollments;

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true)
    @com.fasterxml.jackson.annotation.JsonIgnore
    @ToString.Exclude
    private java.util.Set<CourseGroup> groups;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
