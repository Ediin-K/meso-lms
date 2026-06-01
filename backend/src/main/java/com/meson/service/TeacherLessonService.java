package com.meson.service;

import com.meson.dto.LessonRequest;
import com.meson.dto.LessonResponse;
import com.meson.dto.LessonResourceResponse;
import com.meson.entity.Lesson;
import com.meson.entity.Module;
import com.meson.entity.User;
import com.meson.repository.LessonRepository;
import com.meson.repository.ModuleRepository;
import com.meson.repository.UserRepository;
import com.meson.repository.LessonResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TeacherLessonService {

    private final LessonRepository lessonRepository;
    private final ModuleRepository moduleRepository;
    private final UserRepository userRepository;
    private final LessonResourceRepository lessonResourceRepository;
    private final LessonResourceMapper lessonResourceMapper;

    public List<LessonResponse> getLessonsByModule(Long moduleId) {
        User teacher = getCurrentUser();
        
        moduleRepository.findByIdAndCourseTeacherId(moduleId, teacher.getId())
                .orElseThrow(() -> new AccessDeniedException("Ju nuk keni akses në këtë modul ose moduli nuk ekziston."));

        return lessonRepository.findByModuleIdOrderByRradhitjaAsc(moduleId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public LessonResponse createLesson(LessonRequest request) {
        User teacher = getCurrentUser();
        Module module = moduleRepository.findByIdAndCourseTeacherId(request.getModuleId(), teacher.getId())
                .orElseThrow(() -> new AccessDeniedException("Ju nuk keni akses në këtë modul ose moduli nuk ekziston."));

        Lesson lesson = Lesson.builder()
                .titulli(request.getTitulli())
                .permbajtja(request.getPermbajtja())
                .lloji(request.getLloji())
                .videoUrl(request.getVideoUrl())
                .resourceUrl(request.getResourceUrl())
                .rradhitja(request.getRradhitja())
                .module(module)
                .build();

        return toResponse(lessonRepository.save(lesson));
    }

    public LessonResponse updateLesson(Long id, LessonRequest request) {
        User teacher = getCurrentUser();
        Lesson lesson = lessonRepository.findByIdAndModuleCourseTeacherId(id, teacher.getId())
                .orElseThrow(() -> new AccessDeniedException("Ju nuk keni akses në këtë lëndë ose lënda nuk ekziston."));

        lesson.setTitulli(request.getTitulli());
        lesson.setPermbajtja(request.getPermbajtja());
        lesson.setLloji(request.getLloji());
        lesson.setVideoUrl(request.getVideoUrl());
        lesson.setResourceUrl(request.getResourceUrl());
        lesson.setRradhitja(request.getRradhitja());

        return toResponse(lessonRepository.save(lesson));
    }

    @Transactional
    public void deleteLesson(Long id) {
        User teacher = getCurrentUser();
        Lesson lesson = lessonRepository.findByIdAndModuleCourseTeacherId(id, teacher.getId())
                .orElseThrow(() -> new AccessDeniedException("Ju nuk keni akses në këtë lëndë ose lënda nuk ekziston."));

        lessonRepository.delete(lesson);
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Përdoruesi nuk u gjet."));
    }

    private LessonResponse toResponse(Lesson lesson) {
        return LessonResponse.builder()
                .id(lesson.getId())
                .titulli(lesson.getTitulli())
                .permbajtja(lesson.getPermbajtja())
                .lloji(lesson.getLloji())
                .videoUrl(lesson.getVideoUrl())
                .resourceUrl(lesson.getResourceUrl())
                .rradhitja(lesson.getRradhitja())
                .moduleId(lesson.getModule().getId())
                .moduleTitulli(lesson.getModule().getTitulli())
                .createdAt(lesson.getCreatedAt())
                .resources(lessonResourceRepository.findByLessonId(lesson.getId()).stream()
                        .map(lessonResourceMapper::toResponse)
                        .collect(Collectors.toList()))
                .build();
    }
}
