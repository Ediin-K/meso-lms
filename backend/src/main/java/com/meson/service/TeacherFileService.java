package com.meson.service;

import com.meson.dto.LessonResourceResponse;
import com.meson.entity.Lesson;
import com.meson.entity.LessonResource;
import com.meson.entity.User;
import com.meson.repository.LessonRepository;
import com.meson.repository.LessonResourceRepository;
import com.meson.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TeacherFileService {

    private final FileStorageService fileStorageService;
    private final LessonResourceRepository lessonResourceRepository;
    private final LessonRepository lessonRepository;
    private final UserRepository userRepository;

    public List<LessonResourceResponse> getResourcesByLesson(Long lessonId) {
        User teacher = getCurrentUser();
        // Validate ownership
        lessonRepository.findByIdAndModuleCourseTeacherId(lessonId, teacher.getId())
                .orElseThrow(() -> new AccessDeniedException("Ju nuk keni akses në këtë lëndë."));

        return lessonResourceRepository.findByLessonId(lessonId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public LessonResourceResponse uploadFile(Long lessonId, MultipartFile file) {
        User teacher = getCurrentUser();
        Lesson lesson = lessonRepository.findByIdAndModuleCourseTeacherId(lessonId, teacher.getId())
                .orElseThrow(() -> new AccessDeniedException("Ju nuk keni akses në këtë lëndë."));

        // Validate file type (basic extension check)
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || !isValidExtension(originalFilename)) {
            throw new RuntimeException("Tipi i skedarit nuk lejohet.");
        }

        // Structured path: courses/{courseId}/lessons/{lessonId}
        String subPath = "courses/" + lesson.getModule().getCourse().getId() + "/lessons/" + lessonId;
        String storedPath = fileStorageService.store(file, subPath);

        LessonResource resource = LessonResource.builder()
                .emriOrigjinal(originalFilename)
                .emriRuajtur(storedPath.substring(storedPath.lastIndexOf("/") + 1))
                .path(storedPath)
                .tipi(file.getContentType())
                .madhesia(file.getSize())
                .lesson(lesson)
                .uploadedBy(teacher)
                .build();

        return toResponse(lessonResourceRepository.save(resource));
    }

    @Transactional
    public void deleteFile(Long resourceId) {
        User teacher = getCurrentUser();
        LessonResource resource = lessonResourceRepository.findById(resourceId)
                .orElseThrow(() -> new RuntimeException("Skedari nuk u gjet."));

        // Check ownership of the course the lesson belongs to
        if (!resource.getLesson().getModule().getCourse().getTeacher().getId().equals(teacher.getId())) {
            throw new AccessDeniedException("Ju nuk keni akses për të fshirë këtë skedar.");
        }

        fileStorageService.delete(resource.getPath());
        lessonResourceRepository.delete(resource);
    }

    private boolean isValidExtension(String filename) {
        String lower = filename.toLowerCase();
        return lower.endsWith(".pdf") || lower.endsWith(".docx") || lower.endsWith(".doc") ||
               lower.endsWith(".pptx") || lower.endsWith(".ppt") || lower.endsWith(".xlsx") ||
               lower.endsWith(".xls") || lower.endsWith(".txt") || lower.endsWith(".csv") ||
               lower.endsWith(".zip") || lower.endsWith(".rar") ||
               lower.endsWith(".jpg") || lower.endsWith(".jpeg") || lower.endsWith(".png") ||
               lower.endsWith(".mp4") || lower.endsWith(".mkv");
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Përdoruesi nuk u gjet."));
    }

    private LessonResourceResponse toResponse(LessonResource resource) {
        return LessonResourceResponse.builder()
                .id(resource.getId())
                .emriOrigjinal(resource.getEmriOrigjinal())
                .tipi(resource.getTipi())
                .madhesia(resource.getMadhesia())
                .url("/files/download/" + resource.getId())
                .createdAt(resource.getCreatedAt())
                .build();
    }
}
