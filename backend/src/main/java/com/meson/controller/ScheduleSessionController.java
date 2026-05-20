package com.meson.controller;

import com.meson.dto.ScheduleSessionRequest;
import com.meson.dto.ScheduleSessionResponse;
import com.meson.service.ScheduleSessionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/schedules")
@RequiredArgsConstructor
public class ScheduleSessionController {

    private final ScheduleSessionService scheduleSessionService;

    @GetMapping
    public ResponseEntity<List<ScheduleSessionResponse>> getAll() {
        return ResponseEntity.ok(scheduleSessionService.getAll());
    }

    @GetMapping("/student/{userId}")
    public ResponseEntity<List<ScheduleSessionResponse>> getForStudent(@PathVariable Long userId) {
        return ResponseEntity.ok(scheduleSessionService.getForStudent(userId));
    }

    @GetMapping("/teacher/{teacherId}")
    public ResponseEntity<List<ScheduleSessionResponse>> getForTeacher(@PathVariable Long teacherId) {
        return ResponseEntity.ok(scheduleSessionService.getForTeacher(teacherId));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<ScheduleSessionResponse> create(@Valid @RequestBody ScheduleSessionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(scheduleSessionService.create(request));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<ScheduleSessionResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody ScheduleSessionRequest request) {
        return ResponseEntity.ok(scheduleSessionService.update(id, request));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        scheduleSessionService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
