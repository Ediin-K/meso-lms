package com.meson.service;

import com.meson.dto.CertificateRequest;
import com.meson.dto.CertificateResponse;
import com.meson.entity.Certificate;
import com.meson.entity.Enrollment;
import com.meson.entity.EnrollmentStatus;
import com.meson.repository.CertificateRepository;
import com.meson.repository.EnrollmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CertificateService {

    private final CertificateRepository certificateRepository;
    private final EnrollmentRepository enrollmentRepository;

    public List<CertificateResponse> getAll() {
        return certificateRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public CertificateResponse getById(Long id) {
        Certificate certificate = certificateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Certifikata nuk u gjet"));
        return toResponse(certificate);
    }

    public CertificateResponse getByKodiUnik(String kodiUnik) {
        Certificate certificate = certificateRepository.findByKodiUnik(kodiUnik)
                .orElseThrow(() -> new RuntimeException("Certifikata nuk u gjet"));
        return toResponse(certificate);
    }

    public List<CertificateResponse> getByUserId(Long userId) {
        return certificateRepository.findByEnrollmentUserId(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public CertificateResponse create(CertificateRequest request) {
        if (certificateRepository.existsByEnrollmentId(request.getEnrollmentId())) {
            throw new RuntimeException("Certifikata ekziston tashme per kete regjistrim");
        }

        Enrollment enrollment = enrollmentRepository.findById(request.getEnrollmentId())
                .orElseThrow(() -> new RuntimeException("Regjistrimi nuk u gjet"));

        if (enrollment.getStatusi() != EnrollmentStatus.PERFUNDUAR) {
            throw new RuntimeException("Studenti nuk e ka perfunduar kursin");
        }

        Certificate certificate = new Certificate();
        certificate.setEnrollment(enrollment);

        return toResponse(certificateRepository.save(certificate));
    }

    public String createForEnrollment(Enrollment enrollment) {
        return certificateRepository.findByEnrollmentId(enrollment.getId())
                .map(Certificate::getKodiUnik)
                .orElseGet(() -> {
                    Certificate cert = new Certificate();
                    cert.setEnrollment(enrollment);
                    return certificateRepository.save(cert).getKodiUnik();
                });
    }

    public void delete(Long id) {
        if (!certificateRepository.existsById(id)) {
            throw new RuntimeException("Certifikata nuk u gjet");
        }
        certificateRepository.deleteById(id);
    }

    private CertificateResponse toResponse(Certificate certificate) {
        return CertificateResponse.builder()
                .id(certificate.getId())
                .enrollmentId(certificate.getEnrollment().getId())
                .userId(certificate.getEnrollment().getUser().getId())
                .userEmri(certificate.getEnrollment().getUser().getEmri())
                .courseId(certificate.getEnrollment().getCourse().getId())
                .courseTitulli(certificate.getEnrollment().getCourse().getTitulli())
                .kodiUnik(certificate.getKodiUnik())
                .dataLeshimit(certificate.getDataLeshimit())
                .build();
    }
}
