package com.meson.controller;

import com.meson.dto.AssignStudentGroupRequest;
import com.meson.dto.DirectionGroupResponse;
import com.meson.entity.User;
import com.meson.repository.UserRepository;
import com.meson.service.StudentGroupRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/students")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminStudentGroupController {

    private final StudentGroupRequestService studentGroupRequestService;
    private final UserRepository userRepository;

    @PostMapping("/{userId}/assign-group")
    public ResponseEntity<DirectionGroupResponse> assignGroup(
            @PathVariable Long userId,
            @Valid @RequestBody AssignStudentGroupRequest request) {
        return ResponseEntity.ok(
                studentGroupRequestService.adminAssignStudent(userId, request, getCurrentUserId()));
    }

    @DeleteMapping("/{userId}/assign-group")
    public ResponseEntity<Void> removeGroup(@PathVariable Long userId) {
        studentGroupRequestService.adminRemoveStudent(userId);
        return ResponseEntity.noContent().build();
    }

    private Long getCurrentUserId() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Perdoruesi nuk u gjet"));
        return user.getId();
    }
}
