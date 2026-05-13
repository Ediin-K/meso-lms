package com.meson.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;
import java.util.ArrayList;



@Entity
@Table(name="course_categories")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(exclude = {"courses"})
public class CourseCategory{

    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;

    @Column(nullable= false,unique=true)
    private String emertimi;

    @Column(columnDefinition = "TEXT")
    private String pershkrimi;

    @Builder.Default
    @OneToMany(mappedBy="courseCategory" ,fetch = FetchType.LAZY)
    private List<Course> courses = new ArrayList<>();

}