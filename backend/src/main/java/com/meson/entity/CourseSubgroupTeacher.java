package com.meson.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "course_subgroup_teachers")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(exclude = {"courseSubgroup", "teacher"})
public class CourseSubgroupTeacher {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "course_subgroup_id", nullable = false)
    private CourseSubgroup courseSubgroup;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "teacher_id", nullable = false)
    private User teacher;

    @Column(nullable = false)
    private String role;
}
