package com.meson.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "enrollments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(exclude = {"user", "course", "courseGroup", "courseSubgroup"})
public class Enrollment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_group_id")
    private CourseGroup courseGroup;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_subgroup_id")
    private CourseSubgroup courseSubgroup;

    @Builder.Default
    private Double progresi = 0.0;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EnrollmentStatus statusi = EnrollmentStatus.AKTIV;

    @Column(nullable = false, updatable = false)
    private LocalDateTime dataRegjistrimit;

    @PrePersist
    protected void onCreate() {
        this.dataRegjistrimit = LocalDateTime.now();
    }
}
