package com.meson.service;

import com.meson.dto.AdminStatsDTO;
import com.meson.dto.MonthlyCountDTO;
import com.meson.dto.NameValueDTO;
import com.meson.entity.Enrollment;
import com.meson.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Service
@RequiredArgsConstructor
public class AdminStatsService {

    private final UserRepository       userRepository;
    private final CourseRepository     courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final CertificateRepository certificateRepository;

    private static final String[] MONTHS = {
        "Jan","Shk","Mar","Pri","Maj","Qer","Korr","Gush","Sht","Tet","Nën","Dhj"
    };

    public AdminStatsDTO getStats() {
        long totalUsers       = userRepository.count();
        long totalCourses     = courseRepository.count();
        long totalEnrollments = enrollmentRepository.count();
        long totalStudents    = userRepository.countByRole("STUDENT");
        long totalTeachers    = userRepository.countByRole("TEACHER");
        long totalCertificates = certificateRepository.count();

        return new AdminStatsDTO(
            totalUsers,
            totalCourses,
            totalEnrollments,
            totalStudents,
            totalTeachers,
            totalCertificates,
            buildEnrollmentsByMonth(),
            buildCoursesByCategory(),
            buildEnrollmentsByStatus()
        );
    }

    private List<MonthlyCountDTO> buildEnrollmentsByMonth() {
        int year = LocalDateTime.now().getYear();
        List<Enrollment> all = enrollmentRepository.findAll();

        Map<Integer, Long> byMonth = all.stream()
            .filter(e -> e.getDataRegjistrimit() != null
                      && e.getDataRegjistrimit().getYear() == year)
            .collect(Collectors.groupingBy(
                e -> e.getDataRegjistrimit().getMonthValue(),
                Collectors.counting()
            ));

        return IntStream.rangeClosed(1, 12)
            .mapToObj(m -> new MonthlyCountDTO(MONTHS[m - 1], byMonth.getOrDefault(m, 0L)))
            .collect(Collectors.toList());
    }

    private List<NameValueDTO> buildCoursesByCategory() {
        return courseRepository.findAll().stream()
            .collect(Collectors.groupingBy(
                c -> c.getCourseCategory() != null
                    ? c.getCourseCategory().getEmertimi()
                    : "Pa kategori",
                Collectors.counting()
            ))
            .entrySet().stream()
            .map(e -> new NameValueDTO(e.getKey(), e.getValue()))
            .sorted(Comparator.comparingLong(NameValueDTO::getValue).reversed())
            .collect(Collectors.toList());
    }

    private List<NameValueDTO> buildEnrollmentsByStatus() {
        Map<String, Long> byStatus = enrollmentRepository.findAll().stream()
            .filter(e -> e.getStatusi() != null)
            .collect(Collectors.groupingBy(
                e -> e.getStatusi().name(),
                Collectors.counting()
            ));
        return List.of(
            new NameValueDTO("Aktiv",       byStatus.getOrDefault("AKTIV",       0L)),
            new NameValueDTO("Përfunduar",  byStatus.getOrDefault("PERFUNDUAR",  0L)),
            new NameValueDTO("Anuluar",     byStatus.getOrDefault("ANULUAR",     0L))
        );
    }
}
