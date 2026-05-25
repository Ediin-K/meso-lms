package com.meson.controller;

import com.meson.entity.EnrollmentStatus;
import com.meson.entity.LessonResource;
import com.meson.entity.User;
import com.meson.repository.EnrollmentRepository;
import com.meson.repository.LessonResourceRepository;
import com.meson.repository.UserRepository;
import com.meson.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.CacheControl;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.time.Duration;

@RestController
@RequestMapping({"/api/resources", "/api/files"})
@RequiredArgsConstructor
public class FileController {

    private final FileStorageService fileStorageService;
    private final LessonResourceRepository lessonResourceRepository;
    private final UserRepository userRepository;
    private final EnrollmentRepository enrollmentRepository;

    @GetMapping("/{id}/view")
    public ResponseEntity<Resource> viewResource(@PathVariable Long id) {
        return serve(id, false);
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> downloadResource(@PathVariable Long id) {
        return serve(id, true);
    }

    @GetMapping("/download/{id}")
    public ResponseEntity<Resource> legacyDownload(@PathVariable Long id) {
        return downloadResource(id);
    }

    private ResponseEntity<Resource> serve(Long id, boolean attachment) {
        LessonResource resource = lessonResourceRepository.findByIdWithLessonCourse(id)
                .orElseThrow(() -> new RuntimeException("Skedari nuk u gjet."));
        assertCanAccess(resource);

        Resource file = fileStorageService.loadAsResource(resource.getPath());
        MediaType mediaType = resolveMediaType(resource, file);
        ContentDisposition disposition = (attachment ? ContentDisposition.attachment() : ContentDisposition.inline())
                .filename(resource.getEmriOrigjinal(), StandardCharsets.UTF_8)
                .build();

        ResponseEntity.BodyBuilder response = ResponseEntity.ok()
                .contentType(mediaType)
                .cacheControl(CacheControl.maxAge(Duration.ofMinutes(10)).cachePrivate())
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition.toString())
                .header(HttpHeaders.ACCEPT_RANGES, "bytes");

        if (resource.getMadhesia() != null && resource.getMadhesia() >= 0) {
            response.contentLength(resource.getMadhesia());
        }

        return response.body(file);
    }

    private MediaType resolveMediaType(LessonResource resource, Resource file) {
        String mimeType = resource.getTipi();
        if (mimeType == null || mimeType.isBlank() || MediaType.APPLICATION_OCTET_STREAM_VALUE.equals(mimeType)) {
            try {
                mimeType = Files.probeContentType(file.getFile().toPath());
            } catch (Exception ignored) {
                mimeType = null;
            }
        }
        try {
            return mimeType != null && !mimeType.isBlank()
                    ? MediaType.parseMediaType(mimeType)
                    : MediaType.APPLICATION_OCTET_STREAM;
        } catch (Exception ignored) {
            return MediaType.APPLICATION_OCTET_STREAM;
        }
    }

    private void assertCanAccess(LessonResource resource) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) {
            throw new AccessDeniedException("Duhet te kycesh per te hapur materialin.");
        }
        if (hasRole(auth, "ADMIN")) {
            return;
        }

        User current = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new AccessDeniedException("Perdoruesi nuk u gjet."));
        Long courseId = resource.getLesson().getModule().getCourse().getId();
        Long teacherId = resource.getLesson().getModule().getCourse().getTeacher() != null
                ? resource.getLesson().getModule().getCourse().getTeacher().getId()
                : null;

        if (hasRole(auth, "TEACHER") && current.getId().equals(teacherId)) {
            return;
        }
        if (hasRole(auth, "STUDENT")
                && enrollmentRepository.findByUserIdAndCourseId(current.getId(), courseId)
                .filter(e -> e.getStatusi() == EnrollmentStatus.AKTIV)
                .isPresent()) {
            return;
        }

        throw new AccessDeniedException("Nuk ke akses ne kete material.");
    }

    private boolean hasRole(Authentication auth, String role) {
        String target = "ROLE_" + role;
        for (GrantedAuthority authority : auth.getAuthorities()) {
            if (target.equals(authority.getAuthority())) {
                return true;
            }
        }
        return false;
    }
}
