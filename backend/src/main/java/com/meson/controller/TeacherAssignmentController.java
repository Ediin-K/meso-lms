package com.meson.controller;

import com.meson.dto.AssignmentResponse;
import com.meson.dto.AssignmentSubmissionResponse;
import com.meson.repository.UserRepository;
import com.meson.service.AssignmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/teacher")
@PreAuthorize("hasRole('TEACHER')")
@RequiredArgsConstructor
public class TeacherAssignmentController {

    private final AssignmentService assignmentService;
    private final UserRepository userRepository;

    @PostMapping("/lessons/{lessonId}/assignment")
    public AssignmentResponse upsert(@PathVariable Long lessonId,
                                     @RequestBody Map<String, String> body) {
        String raw = body.get("deadline");
        LocalDateTime deadline = LocalDateTime.parse(raw);
        return assignmentService.upsertForLesson(lessonId, deadline, currentUserId());
    }

    @DeleteMapping("/lessons/{lessonId}/assignment")
    public ResponseEntity<Void> delete(@PathVariable Long lessonId) {
        assignmentService.deleteForLesson(lessonId, currentUserId());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/lessons/{lessonId}/assignment/attachment")
    public AssignmentResponse uploadAttachment(@PathVariable Long lessonId,
                                               @RequestParam("file") MultipartFile file) {
        return assignmentService.uploadAttachment(lessonId, file, currentUserId());
    }

    @DeleteMapping("/lessons/{lessonId}/assignment/attachment")
    public AssignmentResponse removeAttachment(@PathVariable Long lessonId) {
        return assignmentService.removeAttachment(lessonId, currentUserId());
    }

    @GetMapping("/lessons/{lessonId}/assignment/submissions")
    public List<AssignmentSubmissionResponse> getSubmissions(@PathVariable Long lessonId) {
        return assignmentService.getSubmissionsByLesson(lessonId, currentUserId());
    }

    @GetMapping("/submissions/{subId}/file")
    public ResponseEntity<Resource> downloadSubmission(@PathVariable Long subId) {
        Resource resource = assignmentService.serveSubmissionFile(subId, currentUserId());
        String filename = assignmentService.getSubmissionFileName(subId, currentUserId());
        if (filename == null) filename = "submission";
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(resource);
    }

    @GetMapping("/assignments")
    public List<AssignmentResponse> getAll() {
        return assignmentService.getTeacherAssignments(currentUserId());
    }

    private Long currentUserId() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Përdoruesi nuk u gjet"))
                .getId();
    }
}
