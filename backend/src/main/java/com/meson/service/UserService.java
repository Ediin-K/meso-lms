package com.meson.service;

import com.meson.dto.UserDTO;
import com.meson.entity.Role;
import com.meson.entity.User;
import com.meson.entity.UserRole;
import com.meson.repository.RoleRepository;
import com.meson.repository.UserRepository;
import com.meson.repository.UserRoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.List;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final RoleRepository roleRepository;
    private final UserRoleRepository userRoleRepository;
    private String normalizeRoleForDB(String role) {
        if ("parent".equals(role)) return "prind";
        return role;
    }

    private String normalizeRoleForFrontend(String role) {
        if ("prind".equals(role)) return "parent";
        return role;
    }

    public void activate(Long id) {
        User user = getById(id);
        user.setStatusi("active");
        userRepository.save(user);
    }

    public void deactivate(Long id) {
        User user = getById(id);
        user.setStatusi("inactive");
        userRepository.save(user);
    }

    public List<UserDTO> getAll() {
        return userRepository.findAllWithRoles().stream()
                .map(user -> new UserDTO(
                        user.getId(),
                        user.getEmri(),
                        user.getMbiemri(),
                        user.getEmail(),
                        user.getStatusi(),
                        user.getUserRoles().stream()
                                .findFirst()
                                .map(userRole -> normalizeRoleForFrontend(userRole.getRole().getEmertimi()))
                                .orElse("unknown"),
                        user.getDataKrijimit()
                ))
                .toList();
    }

    public User getById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User nuk u gjet"));
    }

    public User create(User user) {
        if (userRepository.existsByEmailIgnoreCase(user.getEmail())) {
            throw new RuntimeException("Email ekziston tashmë");
        }
        user.setPasswordHash(passwordEncoder.encode(user.getPasswordHash()));
        user.setDataKrijimit(LocalDateTime.now());
        user.setStatusi("active");
        User savedUser = userRepository.save(user);

        // Assign role if provided
        if (user.getRole() != null && !user.getRole().isEmpty()) {
            String dbRole = normalizeRoleForDB(user.getRole());
            Role role = roleRepository.findByEmertimi(dbRole)
                    .orElseThrow(() -> new RuntimeException("Role nuk u gjet: " + dbRole));
            UserRole userRole = UserRole.builder()
                    .user(savedUser)
                    .role(role)
                    .build();
            userRoleRepository.save(userRole);
        }

        return savedUser;
    }

    public User update(Long id, User updated) {
        User user = getById(id);
        user.setEmri(updated.getEmri());
        user.setMbiemri(updated.getMbiemri());
        user.setPhoneNumber(updated.getPhoneNumber());
        user.setStatusi(updated.getStatusi());

        // Update role if provided
        if (updated.getRole() != null && !updated.getRole().isEmpty()) {
            // Remove existing roles
            userRoleRepository.deleteAll(user.getUserRoles());

            // Add new role
            String dbRole = normalizeRoleForDB(updated.getRole());
            Role role = roleRepository.findByEmertimi(dbRole)
                    .orElseThrow(() -> new RuntimeException("Role nuk u gjet: " + dbRole));
            UserRole userRole = UserRole.builder()
                    .user(user)
                    .role(role)
                    .build();
            userRoleRepository.save(userRole);
        }

        return userRepository.save(user);
    }

    public void delete(Long id) {
        userRepository.deleteById(id);
    }
}