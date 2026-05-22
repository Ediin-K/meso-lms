package com.meson.controller;

import com.meson.dto.AuthResponse;
import com.meson.dto.LoginRequest;
import com.meson.service.AuthService;
import lombok.RequiredArgsConstructor;
import com.meson.dto.RefreshTokenRequest;
import com.meson.service.RefreshTokenService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"})
public class AuthController {

    private final AuthService authService;
    private final RefreshTokenService refreshTokenService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(@RequestBody RefreshTokenRequest request) {
        System.out.println("REFRESH REQUEST: " + request.getRefreshToken());
        return ResponseEntity.ok(refreshTokenService.refresh(request));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@RequestBody RefreshTokenRequest request) {
        refreshTokenService.logout(request);
        return ResponseEntity.noContent().build();
    }
}