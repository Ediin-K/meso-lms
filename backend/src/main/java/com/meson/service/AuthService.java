package com.meson.service;

import com.meson.dto.AuthResponse;
import com.meson.dto.LoginRequest;
import com.meson.entity.Role;
import com.meson.entity.User;
import com.meson.entity.UserRole;
import com.meson.entity.RefreshToken;
import com.meson.repository.UserRepository;
import com.meson.repository.UserRoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;

    public AuthResponse login(LoginRequest request) {

        // 1. Normalizo email
        String email = request.getEmail().trim().toLowerCase();

        // 2. Gjej userin
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Email ose password gabim"));

        // 3. Kontrollo password (BCrypt)
        boolean isPasswordValid = passwordEncoder.matches(
                request.getPassword(),
                user.getPasswordHash()
        );

        if (!isPasswordValid) {
            throw new RuntimeException("Email ose password gabim");
        }
// Merr Rolin e Userit 
        Role role = userRoleRepository.findByUser(user)
                .stream()
                .findFirst()
                .map(UserRole::getRole)
                .orElse(null);

        String roleName = (role != null)
                ? role.getNormalizedName().toUpperCase()
                : "GUEST";

        String roleDisplay = (role != null)
                ? role.getEmertimi().toLowerCase()
                : "guest";

      // Generate JWT Tokeni.
        String token = jwtService.generateToken(user.getEmail(), roleName);

        
        refreshTokenService.revokeAllUserTokens(user);

        // 7. Create new refresh token
        RefreshToken refreshToken = refreshTokenService.generateRefreshToken(user);

        // 8. Return response
        return new AuthResponse(
                token,
                user.getEmail(),
                roleDisplay,
                refreshToken.getToken(),
                user.getId()
        );
    }
}