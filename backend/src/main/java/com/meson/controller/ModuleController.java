package com.meson.controller;

import com.meson.dto.ModuleRequest;
import com.meson.dto.ModuleResponse;
import com.meson.service.ModuleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/courses/{courseId}/modules")
@RequiredArgsConstructor
public class ModuleController{

    private final ModuleService moduleService;

    @GetMapping
    public ResponseEntity<List<ModuleResponse>> getAll(@PathVariable Long courseId){
        return ResponseEntity.ok(moduleService.getByCourseId(courseId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ModuleResponse> getById(@PathVariable Long courseId,
                                                  @PathVariable Long id ){
        return ResponseEntity.ok(moduleService.getById(id));
    }

    @PostMapping
    public ResponseEntity<ModuleResponse> create(@Valid @RequestBody ModuleRequest request){
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(moduleService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ModuleResponse> update(@PathVariable Long courseId,
                                                 @PathVariable Long id,
                                                 @Valid @RequestBody ModuleRequest request){
        return ResponseEntity.ok(moduleService.update(id,request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long courseId,
                                       @PathVariable Long id){
        moduleService.delete(id);
        return ResponseEntity.noContent().build();
    }

}
