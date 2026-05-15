package com.meson.controller;

import com.meson.dto.ModuleRequest;
import com.meson.dto.ModuleResponse;
import com.meson.service.TeacherModuleService;
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
public class TeacherModuleController {

    private final TeacherModuleService teacherModuleService;

    @GetMapping("/courses/{courseId}/modules")
    public ResponseEntity<List<ModuleResponse>> getModulesByCourse(@PathVariable Long courseId) {
        return ResponseEntity.ok(teacherModuleService.getModulesByCourse(courseId));
    }

    @PostMapping("/modules")
    public ResponseEntity<ModuleResponse> createModule(@Valid @RequestBody ModuleRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(teacherModuleService.createModule(request));
    }

    @PutMapping("/modules/{id}")
    public ResponseEntity<ModuleResponse> updateModule(
            @PathVariable Long id,
            @Valid @RequestBody ModuleRequest request) {
        return ResponseEntity.ok(teacherModuleService.updateModule(id, request));
    }

    @DeleteMapping("/modules/{id}")
    public ResponseEntity<Void> deleteModule(@PathVariable Long id) {
        teacherModuleService.deleteModule(id);
        return ResponseEntity.noContent().build();
    }
}
