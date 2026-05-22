package com.meson.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.util.Set;

@Entity
@Table(name = "direction_groups")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(exclude = {"courseCategory", "courseGroups"})
public class DirectionGroup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_id", nullable = false)
    private CourseCategory courseCategory;

    @Column(nullable = false)
    private Integer semester;

    @Column(nullable = false)
    private String name;

    @Column(name = "max_capacity", nullable = false)
    private Integer maxCapacity;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private DirectionGroupStatus status = DirectionGroupStatus.ACTIVE;

    @OneToMany(mappedBy = "directionGroup")
    @JsonIgnore
    @ToString.Exclude
    private Set<CourseGroup> courseGroups;
}
