package com.meson.controller;

import com.meson.dto.ChangePasswordRequest;
import com.meson.dto.StudentProfileResponse;
import com.meson.dto.UpdateStudentProfileRequest;
import com.meson.service.StudentProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/student")
@RequiredArgsConstructor
public class StudentProfileController {

    private final StudentProfileService studentProfileService;

    @PreAuthorize("hasRole('ADMIN') or @securityAccessService.canAccessStudent(#userId)")
    @GetMapping("/{userId}/profile")
    public ResponseEntity<StudentProfileResponse> getProfile(@PathVariable Long userId) {
        return ResponseEntity.ok(studentProfileService.getProfile(userId));
    }

    @PreAuthorize("hasRole('ADMIN') or @securityAccessService.canAccessStudent(#userId)")
    @PatchMapping("/{userId}/profile")
    public ResponseEntity<StudentProfileResponse> updateProfile(
            @PathVariable Long userId,
            @Valid @RequestBody UpdateStudentProfileRequest request) {
        return ResponseEntity.ok(studentProfileService.updateProfile(userId, request));
    }

    @PreAuthorize("hasRole('ADMIN') or @securityAccessService.canAccessStudent(#userId)")
    @PostMapping("/{userId}/change-password")
    public ResponseEntity<Map<String, String>> changePassword(
            @PathVariable Long userId,
            @Valid @RequestBody ChangePasswordRequest request) {
        studentProfileService.changePassword(userId, request);
        return ResponseEntity.ok(Map.of("message", "Fjalëkalimi u ndryshua me sukses"));
    }
}
