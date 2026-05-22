package com.meson.service;

import com.meson.entity.User;
import com.meson.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SecurityAccessService {

    private final UserRepository userRepository;

    public boolean canAccessStudent(Long userId) {
        if (hasRole("ADMIN")) {
            return true;
        }
        if (userId == null) {
            return false;
        }
        String email = currentEmail();
        if (email == null) {
            return false;
        }
        return userRepository.findByEmail(email)
                .map(User::getId)
                .map(id -> id.equals(userId))
                .orElse(false);
    }

    private boolean hasRole(String role) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) {
            return false;
        }
        String target = "ROLE_" + role;
        for (GrantedAuthority authority : auth.getAuthorities()) {
            if (target.equals(authority.getAuthority())) {
                return true;
            }
        }
        return false;
    }

    private String currentEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null ? auth.getName() : null;
    }
}
