package com.meson.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.util.Set;

@Entity
@Table(name = "course_subgroups")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(exclude = {"courseGroup", "teachers", "enrollments"})
public class CourseSubgroup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "course_group_id", nullable = false)
    private CourseGroup courseGroup;

    @Column(nullable = false)
    private String name;

    private Integer capacity;

    private String schedule;

    @OneToMany(mappedBy = "courseSubgroup", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    @ToString.Exclude
    private Set<CourseSubgroupTeacher> teachers;

    @OneToMany(mappedBy = "courseSubgroup")
    @JsonIgnore
    @ToString.Exclude
    private Set<Enrollment> enrollments;
}
