package com.meson.controller;

import com.meson.dto.CourseResponse;
import com.meson.dto.CourseRequest;
import com.meson.service.CourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;

    @GetMapping
    public ResponseEntity<List<CourseResponse>> getAll() {
        return ResponseEntity.ok(courseService.getAll());
    }

    @GetMapping("/search")
    public ResponseEntity<List<CourseResponse>> getByCategoryAndSemester(
            @RequestParam Long categoryId,
            @RequestParam Integer semester) {
        return ResponseEntity.ok(
                courseService.getByCategoryAndSemester(categoryId, semester));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CourseResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(courseService.getById(id));
    }

    @GetMapping("/by-semester/{semester}")
    public ResponseEntity<List<CourseResponse>> getBySemester(@PathVariable Integer semester) {
        return ResponseEntity.ok(courseService.getBySemester(semester));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<CourseResponse> create(@Valid @RequestBody CourseRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(courseService.create(request));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<CourseResponse> update(
            @Valid @PathVariable Long id,
            @RequestBody CourseRequest request) {
        return ResponseEntity.ok(courseService.update(id, request));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        courseService.delete(id);
        return ResponseEntity.noContent().build();
    }
}