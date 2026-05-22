package com.meson.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "student_profiles")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(exclude = {"user", "courseCategory", "approvedDirectionGroup"})
public class StudentProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private CourseCategory courseCategory;

    @Column(nullable = false)
    private Integer currentSemester;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_direction_group_id")
    private DirectionGroup approvedDirectionGroup;
}
