package com.meson.service;

import com.meson.dto.EnrollmentResponse;
import com.meson.entity.Enrollment;
import com.meson.entity.User;
import com.meson.repository.EnrollmentRepository;
import com.meson.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TeacherStudentService {

    private final EnrollmentRepository enrollmentRepository;
    private final UserRepository userRepository;

    public List<EnrollmentResponse> getStudentsByTeacher() {
        User teacher = getCurrentUser();
        return enrollmentRepository.findByCourseTeacherId(teacher.getId()).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<EnrollmentResponse> getStudentsByCourse(Long courseId) {
        User teacher = getCurrentUser();
        
        return enrollmentRepository.findByCourseId(courseId).stream()
                .filter(e -> e.getCourse().getTeacher().getId().equals(teacher.getId()))
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Përdoruesi nuk u gjet."));
    }

    private EnrollmentResponse toResponse(Enrollment enrollment) {
        return EnrollmentResponse.builder()
                .id(enrollment.getId())
                .userId(enrollment.getUser().getId())
                .userEmri(enrollment.getUser().getEmri() + " " + enrollment.getUser().getMbiemri())
                .courseId(enrollment.getCourse().getId())
                .courseTitulli(enrollment.getCourse().getTitulli())
                .progresi(enrollment.getProgresi())
                .statusi(enrollment.getStatusi())
                .dataRegjistrimit(enrollment.getDataRegjistrimit())
                .build();
    }
}
