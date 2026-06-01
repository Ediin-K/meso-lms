package com.meson.repository;

import com.meson.entity.Certificate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CertificateRepository extends JpaRepository<Certificate, Long> {
    Optional<Certificate> findByEnrollmentId(Long enrollmentId);
    Optional<Certificate> findByKodiUnik(String kodiUnik);
    List<Certificate> findByEnrollmentUserId(Long userId);
    boolean existsByEnrollmentId(Long enrollmentId);
}
