package com.meson.controller;

import com.meson.dto.CreateDirectionGroupWizardRequest;
import com.meson.dto.DirectionGroupWizardContextResponse;
import com.meson.dto.DirectionGroupWizardResponse;
import com.meson.service.DirectionGroupWizardService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/direction-groups")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class DirectionGroupWizardController {

    private final DirectionGroupWizardService wizardService;

    @GetMapping("/wizard/context")
    public ResponseEntity<DirectionGroupWizardContextResponse> getContext(
            @RequestParam Long categoryId,
            @RequestParam Integer semester) {
        return ResponseEntity.ok(wizardService.getContext(categoryId, semester));
    }

    @PostMapping("/wizard")
    public ResponseEntity<DirectionGroupWizardResponse> create(
            @Valid @RequestBody CreateDirectionGroupWizardRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(wizardService.createGroupWithSchedule(request));
    }

    @GetMapping("/{directionGroupId}/detail")
    public ResponseEntity<DirectionGroupWizardResponse> getDetail(@PathVariable Long directionGroupId) {
        return ResponseEntity.ok(wizardService.getGroupDetail(directionGroupId));
    }
}
