package com.meson.repository;

import com.meson.entity.StudentGroupSelection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface StudentGroupSelectionRepository extends JpaRepository<StudentGroupSelection, Long> {
    boolean existsByStudentId(Long studentId);
    Optional<StudentGroupSelection> findByStudentId(Long studentId);
}
