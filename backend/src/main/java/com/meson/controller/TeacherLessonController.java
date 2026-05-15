package com.meson.controller;

import com.meson.dto.LessonRequest;
import com.meson.dto.LessonResponse;
import com.meson.service.TeacherLessonService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/teacher")
@RequiredArgsConstructor
@PreAuthorize("hasRole('TEACHER')")
public class TeacherLessonController {

    private final TeacherLessonService teacherLessonService;

    @GetMapping("/modules/{moduleId}/lessons")
    public ResponseEntity<List<LessonResponse>> getLessonsByModule(@PathVariable Long moduleId) {
        return ResponseEntity.ok(teacherLessonService.getLessonsByModule(moduleId));
    }

    @PostMapping("/lessons")
    public ResponseEntity<LessonResponse> createLesson(@Valid @RequestBody LessonRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(teacherLessonService.createLesson(request));
    }

    @PutMapping("/lessons/{id}")
    public ResponseEntity<LessonResponse> updateLesson(
            @PathVariable Long id,
            @Valid @RequestBody LessonRequest request) {
        return ResponseEntity.ok(teacherLessonService.updateLesson(id, request));
    }

    @DeleteMapping("/lessons/{id}")
    public ResponseEntity<Void> deleteLesson(@PathVariable Long id) {
        teacherLessonService.deleteLesson(id);
        return ResponseEntity.noContent().build();
    }
}
