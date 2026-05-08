package com.meson.service;

import lombok.*;
import com.meson.repository.UserRepository;
import com.meson.repository.CourseRepository;
import com.meson.repository.EnrollmentRepository;
import com.meson.dto.AdminStatsDTO;
import org.springframework.stereotype.Service;

@Data
@AllArgsConstructor
@Service
public class AdminStatsService {

    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;

    public AdminStatsDTO getStats() {
        long users = userRepository.count();
        long courses = courseRepository.count();
        long enrollments = enrollmentRepository.count();

        return new AdminStatsDTO(users, courses, enrollments);
    }
}
