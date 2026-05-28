package com.meson.controller;

import com.meson.entity.LessonResource;
import com.meson.exception.BadRequestException;
import com.meson.exception.ResourceNotFoundException;
import com.meson.repository.LessonResourceRepository;
import com.meson.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.CacheControl;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
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
        if (id == null || id <= 0) {
            throw new BadRequestException("ID e materialit eshte e pavlefshme.");
        }

        LessonResource resource = lessonResourceRepository.findByIdWithLessonCourse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Skedari nuk u gjet."));

        Resource file;
        try {
            file = fileStorageService.loadAsResource(resource.getPath());
        } catch (RuntimeException ex) {
            throw new ResourceNotFoundException("Skedari nuk u gjet ne disk.");
        }

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

}
