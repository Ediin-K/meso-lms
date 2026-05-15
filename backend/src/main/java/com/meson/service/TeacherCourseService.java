package com.meson.service;

import com.meson.dto.CourseResponse;
import com.meson.dto.CourseRequest;
import com.meson.dto.TeacherStatsDTO;
import com.meson.entity.Course;
import com.meson.entity.User;
import com.meson.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TeacherCourseService {

    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final ModuleRepository moduleRepository;
    private final QuizRepository quizRepository;
    private final AssignmentRepository assignmentRepository;

    public List<CourseResponse> getOwnCourses() {
        User teacher = getCurrentUser();
        return courseRepository.findByTeacherId(teacher.getId()).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public CourseResponse getOwnCourseById(Long id) {
        User teacher = getCurrentUser();
        Course course = courseRepository.findByIdAndTeacherId(id, teacher.getId())
                .orElseThrow(() -> new AccessDeniedException("Ju nuk keni akses në këtë kurs ose kursi nuk ekziston."));
        return toResponse(course);
    }

    public CourseResponse updateCourseBasicInfo(Long id, CourseRequest request) {
        User teacher = getCurrentUser();
        Course course = courseRepository.findByIdAndTeacherId(id, teacher.getId())
                .orElseThrow(() -> new AccessDeniedException("Ju nuk keni akses në këtë kurs ose kursi nuk ekziston."));

        course.setTitulli(request.getTitulli());
        course.setPershkrimi(request.getPershkrimi());
        course.setCmimi(request.getCmimi());
        course.setNiveli(request.getNiveli());
        course.setStatusi(request.getStatusi());
        course.setSemester(request.getSemester());

        return toResponse(courseRepository.save(course));
    }

    public TeacherStatsDTO getStats() {
        User teacher = getCurrentUser();
        long totalCourses = courseRepository.countByTeacherId(teacher.getId());
        long totalStudents = enrollmentRepository.countByCourseTeacherId(teacher.getId());
        long totalQuizzes = quizRepository.countByLessonModuleCourseTeacherId(teacher.getId());
        long totalAssignments = assignmentRepository.countByLessonModuleCourseTeacherId(teacher.getId());

        return new TeacherStatsDTO(totalCourses, totalStudents, totalQuizzes, totalAssignments);
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Përdoruesi nuk u gjet."));
    }

    private CourseResponse toResponse(Course course) {
        return CourseResponse.builder()
                .id(course.getId())
                .titulli(course.getTitulli())
                .pershkrimi(course.getPershkrimi())
                .teacherId(course.getTeacher().getId())
                .teacherName(course.getTeacher().getEmri() + " " + course.getTeacher().getMbiemri())
                .categoryId(course.getCourseCategory() != null ? course.getCourseCategory().getId() : null)
                .categoryName(course.getCourseCategory() != null ? course.getCourseCategory().getEmertimi() : null)
                .semester(course.getSemester())
                .cmimi(course.getCmimi())
                .niveli(course.getNiveli())
                .statusi(course.getStatusi())
                .moduleCount((int) moduleRepository.countByCourseId(course.getId()))
                .studentCount((int) enrollmentRepository.countByCourseId(course.getId()))
                .createdAt(course.getCreatedAt())
                .build();
    }
}
