package com.meson.service;

import com.meson.dto.AuthResponse;
import com.meson.dto.LoginRequest;
import com.meson.dto.RegisterRequest;
import com.meson.entity.Role;
import com.meson.entity.User;
import com.meson.entity.UserRole;
import com.meson.repository.RoleRepository;
import com.meson.repository.UserRepository;
import com.meson.repository.UserRoleRepository;
import com.meson.entity.RefreshToken;
import com.meson.service.RefreshTokenService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserRoleRepository userRoleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;

    public AuthResponse login(LoginRequest request) {

        // 1. Gjej userin nga email
        User user = userRepository.findByEmail(request.getEmail().toLowerCase())
                .orElseThrow(() -> new RuntimeException("Email nuk ekziston!"));

        // 2. Kontrollo passwordin
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Password i gabuar!");
        }

        // 3. Merr rolin e userit
        Role userRole = userRoleRepository.findByUser(user)
                .stream()
                .findFirst()
                .map(UserRole::getRole)
                .orElse(null);
                
        String role = userRole != null ? userRole.getEmertimi().toLowerCase() : "guest";
        String normalizedRole = userRole != null ? userRole.getNormalizedName().toUpperCase() : "GUEST";

        // 4. Gjenero access token
        String token = jwtService.generateToken(user.getEmail(), normalizedRole);

        // 5. Invalido token-at e vjetra
        refreshTokenService.revokeAllUserTokens(user);

        // 6. Gjenero refresh token te ri
        RefreshToken refreshToken = refreshTokenService.generateRefreshToken(user);

        // 7. Kthen AuthResponse
        return new AuthResponse(token, user.getEmail(), role, refreshToken.getToken(), user.getId());
    }

    public AuthResponse register(RegisterRequest request) {

        if (userRepository.existsByEmailIgnoreCase(request.getEmail())) {
            throw new RuntimeException("Email ekziston tashmë!");
        }

        User user = new User();
        user.setEmri(request.getEmri());
        user.setMbiemri(request.getMbiemri());
        user.setEmail(request.getEmail().toLowerCase());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setDataKrijimit(LocalDateTime.now());
        user.setStatusi("active");

        userRepository.save(user);

        Role role = roleRepository.findByNormalizedName(
                request.getRoli().toUpperCase()
        ).orElseThrow(() -> new RuntimeException("Roli nuk u gjet!"));

        UserRole userRole = new UserRole();
        userRole.setUser(user);
        userRole.setRole(role);
        userRoleRepository.save(userRole);

        String token = jwtService.generateToken(user.getEmail(), role.getNormalizedName().toUpperCase());
        return new AuthResponse(token, user.getEmail(), role.getEmertimi().toLowerCase(), null, user.getId());
    }
}