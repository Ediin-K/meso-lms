package com.meson.service;

import com.meson.dto.CreateTeacherRequest;
import com.meson.dto.UpdateTeacherRequest;
import com.meson.dto.TeacherResponse;
import com.meson.dto.AssignTeacherRequest;
import com.meson.entity.User;
import com.meson.entity.Role;
import com.meson.entity.UserRole;
import com.meson.entity.Course;
import com.meson.repository.UserRepository;
import com.meson.repository.RoleRepository;
import com.meson.repository.UserRoleRepository;
import com.meson.repository.CourseRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class TeacherService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserRoleRepository userRoleRepository;
    private final CourseRepository courseRepository;
    private final PasswordEncoder passwordEncoder;

    public TeacherResponse createTeacher(CreateTeacherRequest request) {
        if (userRepository.existsByEmailIgnoreCase(request.getEmail())) {
            throw new RuntimeException("Email ekziston tashmë");
        }

        User teacher = new User();
        teacher.setEmri(request.getEmri());
        teacher.setMbiemri(request.getMbiemri());
        teacher.setEmail(request.getEmail().toLowerCase());
        teacher.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        teacher.setPhoneNumber(request.getPhoneNumber());
        teacher.setDataKrijimit(LocalDateTime.now());
        teacher.setStatusi(request.getStatusi());
        teacher.setLockoutEnabled(false);

        User savedTeacher = userRepository.save(teacher);

        Role teacherRole = roleRepository.findByEmertimi("teacher")
                .orElseThrow(() -> new RuntimeException("Role teacher nuk u gjet"));

        UserRole userRole = UserRole.builder()
                .user(savedTeacher)
                .role(teacherRole)
                .build();
        userRoleRepository.save(userRole);

        return toTeacherResponse(savedTeacher, 0L);
    }

    public TeacherResponse updateTeacher(Long id, UpdateTeacherRequest request) {
        User teacher = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Mësuesi nuk u gjet"));

        if (request.getEmri() != null) teacher.setEmri(request.getEmri());
        if (request.getMbiemri() != null) teacher.setMbiemri(request.getMbiemri());
        if (request.getPhoneNumber() != null) teacher.setPhoneNumber(request.getPhoneNumber());
        if (request.getStatusi() != null) teacher.setStatusi(request.getStatusi());

        if (request.getEmail() != null && !request.getEmail().equals(teacher.getEmail())) {
            if (userRepository.existsByEmailIgnoreCase(request.getEmail())) {
                throw new RuntimeException("Email ekziston tashmë");
            }
            teacher.setEmail(request.getEmail().toLowerCase());
        }

        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            teacher.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        }

        User updatedTeacher = userRepository.save(teacher);
        Long courseCount = (long) courseRepository.findByTeacherId(id).size();
        return toTeacherResponse(updatedTeacher, courseCount);
    }

    public void deleteTeacher(Long id) {
        User teacher = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Mësuesi nuk u gjet"));

        List<Course> courses = courseRepository.findByTeacherId(id);
        if (!courses.isEmpty()) {
            throw new RuntimeException("Nuk mund ta fshish mësuesin; i ka kurse të lidhura. Hiq fillimisht të gjitha kurset ose zhvendo mësuesin.");
        }

        userRepository.deleteById(id);
    }

    public List<TeacherResponse> getAllTeachers() {
        List<User> teachers = userRepository.findAllByRoleNormalizedName("TEACHER");
        return teachers.stream()
                .map(t -> {
                    Long courseCount = (long) courseRepository.findByTeacherId(t.getId()).size();
                    return toTeacherResponse(t, courseCount);
                })
                .toList();
    }

    public TeacherResponse getTeacherById(Long id) {
        User teacher = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Mësuesi nuk u gjet"));

        var userRoles = userRoleRepository.findByUser(teacher);
        boolean isTeacher = userRoles.stream()
                .anyMatch(ur -> "TEACHER".equals(ur.getRole().getNormalizedName()));

        if (!isTeacher) {
            throw new RuntimeException("Përdoruesi nuk ka rolin e mësuesit");
        }

        Long courseCount = (long) courseRepository.findByTeacherId(id).size();
        return toTeacherResponse(teacher, courseCount);
    }

    public List<TeacherResponse> searchTeachers(String term) {
        List<User> teachers = userRepository.searchByRoleNormalizedNameAndTerm("TEACHER", term);
        return teachers.stream()
                .map(t -> {
                    Long courseCount = (long) courseRepository.findByTeacherId(t.getId()).size();
                    return toTeacherResponse(t, courseCount);
                })
                .toList();
    }

    public void assignTeacherToCourse(AssignTeacherRequest request) {
        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new RuntimeException("Kursi nuk u gjet"));

        User teacher = userRepository.findById(request.getTeacherId())
                .orElseThrow(() -> new RuntimeException("Mësuesi nuk u gjet"));

        var userRoles = userRoleRepository.findByUser(teacher);
        boolean isTeacher = userRoles.stream()
                .anyMatch(ur -> "TEACHER".equals(ur.getRole().getNormalizedName()));

        if (!isTeacher) {
            throw new RuntimeException("Përdoruesi nuk ka rolin e mësuesit");
        }

        course.setTeacher(teacher);
        courseRepository.save(course);
    }

    private TeacherResponse toTeacherResponse(User teacher, Long courseCount) {
        return TeacherResponse.builder()
                .id(teacher.getId())
                .emri(teacher.getEmri())
                .mbiemri(teacher.getMbiemri())
                .email(teacher.getEmail())
                .phoneNumber(teacher.getPhoneNumber())
                .statusi(teacher.getStatusi())
                .dataKrijimit(teacher.getDataKrijimit())
                .courseCount(courseCount.intValue())
                .build();
    }
}
