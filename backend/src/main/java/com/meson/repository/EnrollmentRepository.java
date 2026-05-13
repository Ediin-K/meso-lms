package com.meson.repository;

import com.meson.entity.Enrollment;
import com.meson.entity.EnrollmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {
    List<Enrollment> findByUserId(Long userId);
    List<Enrollment> findByCourseId(Long courseId);
    List<Enrollment> findByUserIdAndStatusi(Long userId, EnrollmentStatus statusi);
    Optional<Enrollment> findByUserIdAndCourseId(Long userId, Long courseId);
    boolean existsByUserIdAndCourseId(Long userId, Long courseId);

    List<Enrollment> findByCourseTeacherId(Long teacherId);
    long countByCourseTeacherId(Long teacherId);
    long countByCourseId(Long courseId);
}