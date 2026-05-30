package com.meson.controller;

import com.meson.dto.GradeRequest;
import com.meson.dto.GradeResponse;
import com.meson.dto.StudentGradesSummaryResponse;
import com.meson.service.GradeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/grades")
@RequiredArgsConstructor
public class GradeController {

    private final GradeService gradeService;

    @GetMapping("/student/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER') or @securityAccessService.canAccessStudent(#id)")
    public ResponseEntity<StudentGradesSummaryResponse> getByStudentId(@PathVariable Long id) {
        return ResponseEntity.ok(gradeService.getByStudentId(id));
    }

    @GetMapping("/course/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public ResponseEntity<List<GradeResponse>> getByCourseId(@PathVariable Long id) {
        return ResponseEntity.ok(gradeService.getByCourseId(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public ResponseEntity<GradeResponse> create(@Valid @RequestBody GradeRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(gradeService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public ResponseEntity<GradeResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody GradeRequest request) {
        return ResponseEntity.ok(gradeService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        gradeService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
