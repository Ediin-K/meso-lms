package com.meson.controller;

import com.meson.dto.*;
import com.meson.service.StudentGroupRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/student")
@RequiredArgsConstructor
public class StudentGroupController {

    private final StudentGroupRequestService studentGroupRequestService;

    @PreAuthorize("hasRole('ADMIN') or @securityAccessService.canAccessStudent(#userId)")
    @GetMapping("/{userId}/schedule-overview")
    public ResponseEntity<StudentScheduleOverviewResponse> getScheduleOverview(@PathVariable Long userId) {
        return ResponseEntity.ok(studentGroupRequestService.getScheduleOverview(userId));
    }

    @PreAuthorize("hasRole('ADMIN') or @securityAccessService.canAccessStudent(#userId)")
    @GetMapping("/{userId}/groups/status")
    public ResponseEntity<StudentGroupStatusResponse> getStatus(@PathVariable Long userId) {
        return ResponseEntity.ok(studentGroupRequestService.getStudentStatus(userId));
    }

    @PreAuthorize("hasRole('ADMIN') or @securityAccessService.canAccessStudent(#userId)")
    @GetMapping("/{userId}/groups/available")
    public ResponseEntity<List<AvailableDirectionGroupResponse>> getAvailable(@PathVariable Long userId) {
        return ResponseEntity.ok(studentGroupRequestService.getAvailableGroups(userId));
    }

    @PreAuthorize("hasRole('ADMIN') or @securityAccessService.canAccessStudent(#userId)")
    @PostMapping("/{userId}/groups/apply")
    public ResponseEntity<StudentGroupRequestResponse> apply(
            @PathVariable Long userId,
            @Valid @RequestBody ApplyGroupRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(studentGroupRequestService.apply(userId, request));
    }
}
