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

import java.util.List;

@RestController
@RequestMapping("/api/assignments")
@RequiredArgsConstructor
public class AssignmentController {

    private final AssignmentService assignmentService;
    private final UserRepository userRepository;

    @GetMapping("/lesson/{lessonId}")
    public ResponseEntity<AssignmentResponse> getByLesson(@PathVariable Long lessonId) {
        return assignmentService.getByLesson(lessonId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    @GetMapping("/{id}")
    public AssignmentResponse getById(@PathVariable Long id) {
        return assignmentService.getById(id);
    }

    @GetMapping("/{id}/attachment")
    public ResponseEntity<Resource> downloadAttachment(@PathVariable Long id) {
        Resource resource = assignmentService.serveAttachment(id);
        String filename = assignmentService.getAttachmentName(id);
        if (filename == null) filename = "attachment";
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(resource);
    }

    @PostMapping("/{id}/submit")
    @PreAuthorize("hasRole('STUDENT')")
    public AssignmentSubmissionResponse submit(@PathVariable Long id,
                                               @RequestParam("file") MultipartFile file) {
        return assignmentService.submit(id, file, currentUserId());
    }

    @GetMapping("/{id}/my-submission")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<AssignmentSubmissionResponse> getMySubmission(@PathVariable Long id) {
        return assignmentService.getMySubmission(id, currentUserId())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/my-submissions")
    @PreAuthorize("hasRole('STUDENT')")
    public List<AssignmentSubmissionResponse> getMySubmissions() {
        return assignmentService.getMySubmissions(currentUserId());
    }

    private Long currentUserId() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Përdoruesi nuk u gjet"))
                .getId();
    }
}
