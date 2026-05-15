package com.meson.controller;

import com.meson.dto.AssignmentRequest;
import com.meson.dto.AssignmentResponse;
import com.meson.dto.AssignmentSubmissionResponse;
import com.meson.service.TeacherAssignmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/teacher")
@RequiredArgsConstructor
@PreAuthorize("hasRole('TEACHER')")
public class TeacherAssignmentController {

    private final TeacherAssignmentService teacherAssignmentService;

    @GetMapping("/lessons/{lessonId}/assignments")
    public ResponseEntity<List<AssignmentResponse>> getAssignmentsByLesson(@PathVariable Long lessonId) {
        return ResponseEntity.ok(teacherAssignmentService.getAssignmentsByLesson(lessonId));
    }

    @PostMapping("/assignments")
    public ResponseEntity<AssignmentResponse> createAssignment(@Valid @RequestBody AssignmentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(teacherAssignmentService.createAssignment(request));
    }

    @PutMapping("/assignments/{id}")
    public ResponseEntity<AssignmentResponse> updateAssignment(
            @PathVariable Long id,
            @Valid @RequestBody AssignmentRequest request) {
        return ResponseEntity.ok(teacherAssignmentService.updateAssignment(id, request));
    }

    @DeleteMapping("/assignments/{id}")
    public ResponseEntity<Void> deleteAssignment(@PathVariable Long id) {
        teacherAssignmentService.deleteAssignment(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/assignments/{assignmentId}/submissions")
    public ResponseEntity<List<AssignmentSubmissionResponse>> getSubmissionsByAssignment(@PathVariable Long assignmentId) {
        return ResponseEntity.ok(teacherAssignmentService.getSubmissionsByAssignment(assignmentId));
    }

    @PutMapping("/submissions/{id}/grade")
    public ResponseEntity<AssignmentSubmissionResponse> gradeSubmission(
            @PathVariable Long id,
            @RequestBody Map<String, Object> payload) {
        Double nota = Double.valueOf(payload.get("nota").toString());
        String statusi = (String) payload.get("statusi");
        return ResponseEntity.ok(teacherAssignmentService.gradeSubmission(id, nota, statusi));
    }
}
