package com.meson.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.*;
import java.time.LocalDateTime;
import java.util.*;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(exclude = { "userRoles", "userClaims", "userTokens", "refreshTokens" })
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String emri;

    @Column(nullable = false)
    private String mbiemri;

    @Column(nullable = false, unique = true)
    private String email;

    @JsonIgnore
    @Column(nullable = false)
    private String passwordHash;

    private String phoneNumber;

    @Builder.Default
    @Column(nullable = false)
    private boolean emailConfirmed = false;

    @Builder.Default
    @Column(nullable = false)
    private boolean lockoutEnabled = false;

    @Builder.Default
    @Column(nullable = false)
    private int accessFailedCount = 0;

    @Builder.Default
    @Column(nullable = false)
    private LocalDateTime dataKrijimit = LocalDateTime.now();

    @Builder.Default
    @Column(nullable = false)
    private String statusi = "active";

    @Transient
    private String role;

    @JsonIgnore
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private Set<UserRole> userRoles;

    @JsonIgnore
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private Set<UserClaim> userClaims;

    @JsonIgnore
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private Set<UserToken> userTokens;

    @JsonIgnore
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private Set<RefreshToken> refreshTokens;
}
