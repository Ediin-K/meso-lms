package com.meson.controller;

import com.meson.dto.EnrollmentResponse;
import com.meson.service.TeacherStudentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/teacher")
@RequiredArgsConstructor
@PreAuthorize("hasRole('TEACHER')")
public class TeacherStudentController {

    private final TeacherStudentService teacherStudentService;

    @GetMapping("/students")
    public ResponseEntity<List<EnrollmentResponse>> getStudentsByTeacher() {
        return ResponseEntity.ok(teacherStudentService.getStudentsByTeacher());
    }

    @GetMapping("/courses/{courseId}/students")
    public ResponseEntity<List<EnrollmentResponse>> getStudentsByCourse(@PathVariable Long courseId) {
        return ResponseEntity.ok(teacherStudentService.getStudentsByCourse(courseId));
    }
}
