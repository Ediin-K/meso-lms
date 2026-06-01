package com.meson.repository;

import com.meson.entity.Module;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ModuleRepository extends JpaRepository<Module, Long> {
    List<Module> findByCourseIdOrderByRradhitjaAsc(Long courseId);
    List<Module> findByCourseId(Long courseId);
    long countByCourseId(Long courseId);
    boolean existsByTitulliAndCourseId(String titulli,Long courseId);
    void deleteAllByCourseId(Long courseId);

    List<Module> findByCourseTeacherId(Long teacherId);
    Optional<Module> findByIdAndCourseTeacherId(Long id, Long teacherId);
    List<Module> findByCourseIdAndCourseTeacherId(Long courseId, Long teacherId);
}
