package com.meson.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.util.Set;

@Entity
@Table(name = "course_groups")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(exclude = {"course", "directionGroup", "teachers", "subgroups", "enrollments"})
public class CourseGroup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Column(nullable = false)
    private String name;

    private Integer capacity;

    private String schedule;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "direction_group_id")
    private DirectionGroup directionGroup;

    @OneToMany(mappedBy = "courseGroup", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    @ToString.Exclude
    private Set<CourseGroupTeacher> teachers;

    @OneToMany(mappedBy = "courseGroup", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    @ToString.Exclude
    private Set<CourseSubgroup> subgroups;

    @OneToMany(mappedBy = "courseGroup")
    @JsonIgnore
    @ToString.Exclude
    private Set<Enrollment> enrollments;
}
