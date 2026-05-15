package com.meson.controller;

import com.meson.dto.CourseRequest;
import com.meson.dto.CourseResponse;
import com.meson.dto.TeacherStatsDTO;
import com.meson.service.TeacherCourseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/teacher")
@RequiredArgsConstructor
@PreAuthorize("hasRole('TEACHER')")
public class TeacherCourseController {

    private final TeacherCourseService teacherCourseService;

    @GetMapping("/courses")
    public ResponseEntity<List<CourseResponse>> getOwnCourses() {
        return ResponseEntity.ok(teacherCourseService.getOwnCourses());
    }

    @GetMapping("/courses/{id}")
    public ResponseEntity<CourseResponse> getOwnCourseById(@PathVariable Long id) {
        return ResponseEntity.ok(teacherCourseService.getOwnCourseById(id));
    }

    @PutMapping("/courses/{id}")
    public ResponseEntity<CourseResponse> updateCourseBasicInfo(
            @PathVariable Long id,
            @Valid @RequestBody CourseRequest request) {
        return ResponseEntity.ok(teacherCourseService.updateCourseBasicInfo(id, request));
    }

    @GetMapping("/dashboard/stats")
    public ResponseEntity<TeacherStatsDTO> getStats() {
        return ResponseEntity.ok(teacherCourseService.getStats());
    }
}
