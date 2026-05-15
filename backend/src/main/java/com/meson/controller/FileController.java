package com.meson.controller;

import com.meson.entity.LessonResource;
import com.meson.repository.LessonResourceRepository;
import com.meson.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileController {

    private final FileStorageService fileStorageService;
    private final LessonResourceRepository lessonResourceRepository;

    @GetMapping("/download/{id}")
    public ResponseEntity<Resource> downloadFile(@PathVariable Long id) {
        LessonResource resource = lessonResourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Skedari nuk u gjet."));

        Resource file = fileStorageService.loadAsResource(resource.getPath());

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getEmriOrigjinal() + "\"")
                .body(file);
    }
}
