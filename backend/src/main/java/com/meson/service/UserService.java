package com.meson.service;

import com.meson.dto.UserDTO;
import com.meson.dto.CreateUserDTO;
import com.meson.dto.UpdateUserDTO;
import com.meson.entity.Role;
import com.meson.entity.User;
import com.meson.entity.UserRole;
import com.meson.repository.RoleRepository;
import com.meson.repository.UserRepository;
import com.meson.repository.UserRoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional
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

    public User create(CreateUserDTO dto) {
        if (userRepository.existsByEmailIgnoreCase(dto.getEmail())) {
            throw new RuntimeException("Email ekziston tashmë");
        }
        if (dto.getPassword() == null || dto.getPassword().isEmpty()) {
            throw new RuntimeException("Fjalëkalimi nuk mund të jetë bosh");
        }

        User user = new User();
        user.setEmri(dto.getEmri());
        user.setMbiemri(dto.getMbiemri());
        user.setEmail(dto.getEmail());
        user.setPasswordHash(passwordEncoder.encode(dto.getPassword()));
        user.setDataKrijimit(LocalDateTime.now());
        user.setStatusi(dto.getStatusi() != null ? dto.getStatusi() : "active");
        user.setLockoutEnabled(false);
        User savedUser = userRepository.save(user);

        if (dto.getRole() != null && !dto.getRole().isEmpty()) {
            String dbRole = normalizeRoleForDB(dto.getRole());
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

    public User update(Long id, UpdateUserDTO dto) {
        User user = getById(id);


        if (dto.getEmail() != null && !dto.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmailIgnoreCase(dto.getEmail())) {
                throw new RuntimeException("Email ekziston tashmë");
            }
            user.setEmail(dto.getEmail());
        }

        user.setEmri(dto.getEmri());
        user.setMbiemri(dto.getMbiemri());
        user.setPhoneNumber(dto.getPhoneNumber());
        user.setStatusi(dto.getStatusi());

        if (dto.getPassword() != null && !dto.getPassword().isEmpty()) {
            user.setPasswordHash(passwordEncoder.encode(dto.getPassword()));
        }

        if (dto.getRole() != null && !dto.getRole().isEmpty()) {
            String dbRole = normalizeRoleForDB(dto.getRole());
            Role role = roleRepository.findByEmertimi(dbRole)
                    .orElseThrow(() -> new RuntimeException("Role nuk u gjet: " + dbRole));

            var existingRoles = userRoleRepository.findByUser(user);
            if (existingRoles.isEmpty()) {
                UserRole userRole = UserRole.builder()
                        .user(user)
                        .role(role)
                        .build();
                userRoleRepository.save(userRole);
            } else {
                UserRole primaryRole = existingRoles.get(0);
                primaryRole.setRole(role);
                userRoleRepository.save(primaryRole);

                if (existingRoles.size() > 1) {
                    userRoleRepository.deleteAll(existingRoles.subList(1, existingRoles.size()));
                }
            }
        }

        return userRepository.save(user);
    }

    public void delete(Long id) {
        userRepository.deleteById(id);
    }
}