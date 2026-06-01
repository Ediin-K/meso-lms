package com.meson.controller;

import com.meson.dto.LessonRequest;
import com.meson.dto.LessonResponse;
import com.meson.service.LessonService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/modules/{moduleId}/lessons")
@RequiredArgsConstructor
public class LessonController {

    private final LessonService lessonService;

    @GetMapping
    public ResponseEntity<List<LessonResponse>> getAll(@PathVariable Long moduleId) {
        return ResponseEntity.ok(lessonService.getByModuleId(moduleId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<LessonResponse> getById(@PathVariable Long moduleId,
                                                  @PathVariable Long id) {
        return ResponseEntity.ok(lessonService.getById(id));
    }

    @GetMapping("/api/lessons/{id}")
    public ResponseEntity<LessonResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(lessonService.getById(id));
    }

    @PostMapping
    public ResponseEntity<LessonResponse> create(
            @PathVariable Long moduleId,
            @Valid @RequestBody LessonRequest request
    ) {
        request.setModuleId(moduleId);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(lessonService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<LessonResponse> update(
            @PathVariable Long moduleId,
            @PathVariable Long id,
            @Valid @RequestBody LessonRequest request
    ) {
        request.setModuleId(moduleId);

        return ResponseEntity.ok(lessonService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long moduleId,
                                       @PathVariable Long id) {
        lessonService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
