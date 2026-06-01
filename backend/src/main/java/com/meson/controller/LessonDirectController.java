package com.meson.controller;

import com.meson.dto.LessonResponse;
import com.meson.service.LessonService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/lessons")
@RequiredArgsConstructor
public class LessonDirectController {

    private final LessonService lessonService;

    @GetMapping("/{id}")
    public ResponseEntity<LessonResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(lessonService.getById(id));
    }
}
