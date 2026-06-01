package com.meson.controller;

import com.meson.dto.CourseCategoryRequest;
import com.meson.dto.CourseCategoryResponse;
import com.meson.service.CourseCategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/course-categories")
@RequiredArgsConstructor
public class CourseCategoryController{

    private final CourseCategoryService courseCategoryService;

    @GetMapping
    public ResponseEntity<List<CourseCategoryResponse>> getAll(){
        return ResponseEntity.ok(courseCategoryService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CourseCategoryResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(courseCategoryService.getById(id));
    }

    @PostMapping
    public ResponseEntity<CourseCategoryResponse> create(@Valid @RequestBody CourseCategoryRequest request){
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(courseCategoryService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CourseCategoryResponse> update(@Valid @PathVariable Long id,
                                                         @RequestBody CourseCategoryRequest request){
        return ResponseEntity.ok(courseCategoryService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void>delete(@PathVariable Long id){
        courseCategoryService.delete(id);
        return ResponseEntity.noContent().build();
    }

}
