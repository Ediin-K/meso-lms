package com.meson.service;

import com.meson.dto.CourseCategoryRequest;
import com.meson.dto.CourseCategoryResponse;
import com.meson.entity.CourseCategory;
import com.meson.repository.CourseCategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CourseCategoryRepository courseCategoryRepository;

    public List<CourseCategoryResponse> getAll() {
        return courseCategoryRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public CourseCategoryResponse getById(Long id) {
        CourseCategory category = courseCategoryRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Kategoria nuk u gjet"));
        return toResponse(category);
    }

    public CourseCategoryResponse create(CourseCategoryRequest request) {
        if (courseCategoryRepository.existsByEmertimi(request.getEmertimi())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Kategoria me këtë emër ekziston tashmë");
        }

        CourseCategory category = new CourseCategory();
        category.setEmertimi(request.getEmertimi());
        category.setPershkrimi(request.getPershkrimi());

        return toResponse(courseCategoryRepository.save(category));
    }

    public CourseCategoryResponse update(Long id, CourseCategoryRequest request) {
        CourseCategory category = courseCategoryRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Kategoria nuk u gjet"));

        courseCategoryRepository.findByEmertimi(request.getEmertimi())
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(existing -> {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Kategoria me këtë emër ekziston tashmë");
                });

        category.setEmertimi(request.getEmertimi());
        category.setPershkrimi(request.getPershkrimi());

        return toResponse(courseCategoryRepository.save(category));
    }

    public void delete(Long id) {
        CourseCategory category = courseCategoryRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Kategoria nuk u gjet"));

        if (!category.getCourses().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nuk mund të fshish kategorinë — ka kurse në këtë kategori");
        }

        courseCategoryRepository.deleteById(id);
    }

    private CourseCategoryResponse toResponse(CourseCategory category) {
        return CourseCategoryResponse.builder()
                .id(category.getId())
                .emertimi(category.getEmertimi())
                .pershkrimi(category.getPershkrimi())
                .build();
    }
}
