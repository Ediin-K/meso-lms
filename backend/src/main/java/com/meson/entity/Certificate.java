package com.meson.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "certificates")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(exclude = {"enrollment"})
public class Certificate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "enrollment_id", nullable = false, unique = true)
    private Enrollment enrollment;

    @Column(nullable = false, updatable = false)
    private LocalDateTime dataLeshimit;

    @Column(nullable = false, unique = true, updatable = false)
    private String kodiUnik;

    @PrePersist
    protected void onCreate() {
        this.dataLeshimit = LocalDateTime.now();
        this.kodiUnik = UUID.randomUUID().toString();
    }
}
