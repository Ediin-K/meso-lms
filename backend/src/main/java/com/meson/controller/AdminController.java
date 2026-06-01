package com.meson.controller;

import com.meson.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final CertificateRepository certificateRepository;

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Long>> getStats() {
        return ResponseEntity.ok(Map.of(
                "totalUsers", userRepository.count(),
                "totalCourses", courseRepository.count(),
                "totalEnrollments", enrollmentRepository.count(),
                "totalCertificates", certificateRepository.count()
        ));
    }
}
