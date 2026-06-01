package com.meson.controller;

import com.meson.dto.UserRoleRequest;
import com.meson.dto.UserRoleResponse;
import com.meson.service.UserRoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user-roles")
@RequiredArgsConstructor
public class UserRoleController {

    private final UserRoleService userRoleService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<UserRoleResponse>> getUserRoles(@PathVariable Long userId) {
        return ResponseEntity.ok(userRoleService.getUserRoles(userId));
    }

    @PostMapping
    public ResponseEntity<UserRoleResponse>create(@RequestBody UserRoleRequest request){
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(userRoleService.assingRole(request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id){
        userRoleService.removeRole(id);
        return ResponseEntity.noContent().build();
    }
}
