package com.meson.service;

import com.meson.dto.CourseProgressResponse;
import com.meson.dto.LessonViewResponse;
import com.meson.dto.ModuleProgressResponse;
import com.meson.entity.*;
import com.meson.entity.Module;
import com.meson.exception.ResourceNotFoundException;
import com.meson.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProgressService {

    private final LessonProgressRepository progressRepository;
    private final LessonRepository         lessonRepository;
    private final ModuleRepository         moduleRepository;
    private final CourseRepository         courseRepository;
    private final EnrollmentRepository     enrollmentRepository;
    private final UserRepository           userRepository;
    private final CertificateService       certificateService;

    @Transactional
    public LessonViewResponse markLessonViewed(Long lessonId) {
        User student = getCurrentUser();
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResourceNotFoundException("Leksioni nuk u gjet."));

        if (!progressRepository.existsByStudentIdAndLessonId(student.getId(), lessonId)) {
            progressRepository.save(LessonProgress.builder()
                    .student(student)
                    .lesson(lesson)
                    .viewedAt(LocalDateTime.now())
                    .build());
        }

        Long courseId = lesson.getModule().getCourse().getId();
        String courseTitulli = lesson.getModule().getCourse().getTitulli();
        String certCode = recalculateAndMaybeComplete(student.getId(), courseId);

        boolean completed = certCode != null;
        return LessonViewResponse.builder()
                .courseCompleted(completed)
                .certificateCode(certCode)
                .courseTitulli(completed ? courseTitulli : null)
                .build();
    }

    public CourseProgressResponse getCourseProgress(Long courseId) {
        User student = getCurrentUser();
        return buildProgress(courseId, student.getId());
    }

    public CourseProgressResponse getStudentCourseProgress(Long courseId, Long studentId) {
        User teacher = getCurrentUser();
        courseRepository.findByIdAndTeacherId(courseId, teacher.getId())
                .orElseThrow(() -> new AccessDeniedException("Ju nuk keni akses në këtë kurs."));
        return buildProgress(courseId, studentId);
    }

    private String recalculateAndMaybeComplete(Long studentId, Long courseId) {
        return enrollmentRepository.findByUserIdAndCourseId(studentId, courseId)
                .map(enrollment -> {
                    long total  = lessonRepository.countByModuleCourseId(courseId);
                    long viewed = progressRepository.countViewedLessonsByCourse(studentId, courseId);

                    double pct = total > 0 ? Math.round(viewed * 100.0 / total) : 0;
                    enrollment.setProgresi(pct);

                    if (total > 0 && viewed >= total
                            && EnrollmentStatus.AKTIV.equals(enrollment.getStatusi())) {
                        enrollment.setStatusi(EnrollmentStatus.PERFUNDUAR);
                        enrollmentRepository.save(enrollment);
                        return certificateService.createForEnrollment(enrollment);
                    }

                    enrollmentRepository.save(enrollment);
                    return null;
                })
                .orElse(null);
    }

    private CourseProgressResponse buildProgress(Long courseId, Long studentId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Kursi nuk u gjet."));

        List<Module> modules = moduleRepository.findByCourseIdOrderByRradhitjaAsc(courseId);

        List<ModuleProgressResponse> moduleProgress = modules.stream().map(module -> {
            int total  = (int) lessonRepository.countByModuleId(module.getId());
            int viewed = (int) progressRepository.countViewedLessonsByModule(studentId, module.getId());
            double pct = total > 0 ? Math.round(viewed * 100.0 / total) : 0;
            return ModuleProgressResponse.builder()
                    .moduleId(module.getId())
                    .titulli(module.getTitulli())
                    .totalLessons(total)
                    .viewedLessons(viewed)
                    .progressPercent(pct)
                    .build();
        }).collect(Collectors.<ModuleProgressResponse>toList());

        int totalLessons  = moduleProgress.stream().mapToInt(ModuleProgressResponse::getTotalLessons).sum();
        int viewedLessons = moduleProgress.stream().mapToInt(ModuleProgressResponse::getViewedLessons).sum();
        double overallPct = totalLessons > 0 ? Math.round(viewedLessons * 100.0 / totalLessons) : 0;

        return CourseProgressResponse.builder()
                .courseId(courseId)
                .courseTitulli(course.getTitulli())
                .totalLessons(totalLessons)
                .viewedLessons(viewedLessons)
                .progressPercent(overallPct)
                .modules(moduleProgress)
                .build();
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Përdoruesi nuk u gjet."));
    }
}
