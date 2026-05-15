package com.meson.controller;

import com.meson.dto.LessonResourceResponse;
import com.meson.service.TeacherFileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/teacher/files")
@RequiredArgsConstructor
@PreAuthorize("hasRole('TEACHER')")
public class TeacherFileController {

    private final TeacherFileService teacherFileService;

    @GetMapping("/lesson/{lessonId}")
    public ResponseEntity<List<LessonResourceResponse>> getResourcesByLesson(@PathVariable Long lessonId) {
        return ResponseEntity.ok(teacherFileService.getResourcesByLesson(lessonId));
    }

    @PostMapping("/upload/lesson/{lessonId}")
    public ResponseEntity<LessonResourceResponse> uploadFile(
            @PathVariable Long lessonId,
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(teacherFileService.uploadFile(lessonId, file));
    }

    @DeleteMapping("/{resourceId}")
    public ResponseEntity<Void> deleteFile(@PathVariable Long resourceId) {
        teacherFileService.deleteFile(resourceId);
        return ResponseEntity.noContent().build();
    }
}
