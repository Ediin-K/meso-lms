package com.meson.service;

import com.meson.dto.*;
import com.meson.entity.StudentProfile;
import com.meson.entity.User;
import com.meson.entity.UserRole;
import com.meson.exception.BadRequestException;
import com.meson.exception.ResourceNotFoundException;
import com.meson.repository.StudentProfileRepository;
import com.meson.repository.UserRepository;
import com.meson.repository.UserRoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class StudentProfileService {

    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public StudentProfileResponse getProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Perdoruesi nuk u gjet"));

        StudentProfileResponse.StudentProfileResponseBuilder builder = StudentProfileResponse.builder()
                .id(user.getId())
                .emri(user.getEmri())
                .mbiemri(user.getMbiemri())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .statusi(user.getStatusi())
                .dataKrijimit(user.getDataKrijimit())
                .role(resolvePrimaryRole(user));

        studentProfileRepository.findByUserIdWithDetails(userId).ifPresent(profile -> {
            builder.currentSemester(profile.getCurrentSemester());
            if (profile.getCourseCategory() != null) {
                builder.categoryName(profile.getCourseCategory().getEmertimi());
            }
        });

        return builder.build();
    }

    public StudentProfileResponse updateProfile(Long userId, UpdateStudentProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Perdoruesi nuk u gjet"));

        user.setEmri(request.getEmri().trim());
        user.setMbiemri(request.getMbiemri().trim());
        user.setPhoneNumber(request.getPhoneNumber() != null ? request.getPhoneNumber().trim() : null);
        userRepository.save(user);

        return getProfile(userId);
    }

    public void changePassword(Long userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Perdoruesi nuk u gjet"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Fjalëkalimi aktual eshte i gabuar");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    private String resolvePrimaryRole(User user) {
        return userRoleRepository.findByUser(user).stream()
                .map(UserRole::getRole)
                .map(role -> role.getEmertimi() != null ? role.getEmertimi().toUpperCase() : "STUDENT")
                .findFirst()
                .orElse("STUDENT");
    }
}
