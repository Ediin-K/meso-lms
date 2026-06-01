package com.meson.repository;

import com.meson.entity.CourseCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface CourseCategoryRepository extends JpaRepository<CourseCategory, Long> {
    Optional<CourseCategory> findByEmertimi(String emertimi);

    boolean existsByEmertimi(String emertimi);

}
