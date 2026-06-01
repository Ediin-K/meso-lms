package com.meson.controller;

import com.meson.dto.CertificateRequest;
import com.meson.dto.CertificateResponse;
import com.meson.service.CertificateService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/certificates")
@RequiredArgsConstructor
public class CertificateController {

    private final CertificateService certificateService;

    @GetMapping
    public ResponseEntity<List<CertificateResponse>> getAll() {
        return ResponseEntity.ok(certificateService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CertificateResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(certificateService.getById(id));
    }

    @GetMapping("/kod/{kodiUnik}")
    public ResponseEntity<CertificateResponse> getByKodiUnik(@PathVariable String kodiUnik) {
        return ResponseEntity.ok(certificateService.getByKodiUnik(kodiUnik));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<CertificateResponse>> getByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(certificateService.getByUserId(userId));
    }

    @PostMapping
    public ResponseEntity<CertificateResponse> create(@Valid @RequestBody CertificateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(certificateService.create(request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        certificateService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
