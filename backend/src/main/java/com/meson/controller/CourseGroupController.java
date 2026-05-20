package com.meson.controller;

import com.meson.dto.CourseGroupRequest;
import com.meson.dto.CourseGroupResponse;
import com.meson.dto.CourseSubgroupRequest;
import com.meson.dto.CourseSubgroupResponse;
import com.meson.service.CourseGroupService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class CourseGroupController {

    private final CourseGroupService courseGroupService;

    @GetMapping("/api/courses/{courseId}/groups")
    public ResponseEntity<List<CourseGroupResponse>> getCourseGroups(@PathVariable Long courseId) {
        return ResponseEntity.ok(courseGroupService.getByCourse(courseId));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/api/courses/{courseId}/groups")
    public ResponseEntity<CourseGroupResponse> createGroup(
            @PathVariable Long courseId,
            @Valid @RequestBody CourseGroupRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(courseGroupService.createGroup(courseId, request));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/api/course-groups/{groupId}")
    public ResponseEntity<CourseGroupResponse> updateGroup(
            @PathVariable Long groupId,
            @Valid @RequestBody CourseGroupRequest request) {
        return ResponseEntity.ok(courseGroupService.updateGroup(groupId, request));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/api/course-groups/{groupId}")
    public ResponseEntity<Void> deleteGroup(@PathVariable Long groupId) {
        courseGroupService.deleteGroup(groupId);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/api/course-groups/{groupId}/subgroups")
    public ResponseEntity<CourseSubgroupResponse> createSubgroup(
            @PathVariable Long groupId,
            @Valid @RequestBody CourseSubgroupRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(courseGroupService.createSubgroup(groupId, request));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/api/course-subgroups/{subgroupId}")
    public ResponseEntity<CourseSubgroupResponse> updateSubgroup(
            @PathVariable Long subgroupId,
            @Valid @RequestBody CourseSubgroupRequest request) {
        return ResponseEntity.ok(courseGroupService.updateSubgroup(subgroupId, request));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/api/course-subgroups/{subgroupId}")
    public ResponseEntity<Void> deleteSubgroup(@PathVariable Long subgroupId) {
        courseGroupService.deleteSubgroup(subgroupId);
        return ResponseEntity.noContent().build();
    }
}
