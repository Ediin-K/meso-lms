
package com.meson.controller;

import com.meson.dto.EnrollmentRequest;
import com.meson.dto.EnrollmentResponse;
import com.meson.entity.EnrollmentStatus;
import com.meson.service.EnrollmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/enrollments")
@RequiredArgsConstructor
public class EnrollmentController {

    private final EnrollmentService enrollmentService;

    @GetMapping
    public ResponseEntity<List<EnrollmentResponse>> getAll() {
        return ResponseEntity.ok(enrollmentService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EnrollmentResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(enrollmentService.getById(id));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<EnrollmentResponse>> getByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(enrollmentService.getByUserId(userId));
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<EnrollmentResponse>> getByCourseId(@PathVariable Long courseId) {
        return ResponseEntity.ok(enrollmentService.getByCourseId(courseId));
    }

    @PostMapping
    public ResponseEntity<EnrollmentResponse> create(@Valid @RequestBody EnrollmentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(enrollmentService.create(request));
    }

    @PatchMapping("/{id}/progresi")
    public ResponseEntity<EnrollmentResponse> updateProgresi(
            @PathVariable Long id,
            @RequestParam Double progresi) {
        return ResponseEntity.ok(enrollmentService.updateProgresi(id, progresi));
    }

    @PatchMapping("/{id}/statusi")
    public ResponseEntity<EnrollmentResponse> updateStatusi(
            @PathVariable Long id,
            @RequestParam EnrollmentStatus statusi) {
        return ResponseEntity.ok(enrollmentService.updateStatusi(id, statusi));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        enrollmentService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
