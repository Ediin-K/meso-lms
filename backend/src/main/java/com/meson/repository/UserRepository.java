package com.meson.repository;

import com.meson.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    boolean existsByEmailIgnoreCase(String email);
    Optional<User> findByEmail(String email);

    @Query("SELECT u FROM User u LEFT JOIN FETCH u.userRoles ur LEFT JOIN FETCH ur.role")
    List<User> findAllWithRoles();

    @Query("SELECT DISTINCT u FROM User u JOIN u.userRoles ur JOIN ur.role r WHERE LOWER(r.normalizedName) = LOWER(:normalizedName)")
    List<User> findAllByRoleNormalizedName(String normalizedName);

    @Query("SELECT DISTINCT u FROM User u JOIN u.userRoles ur JOIN ur.role r WHERE LOWER(r.normalizedName) = LOWER(:normalizedName) "
            + "AND (LOWER(u.emri) LIKE CONCAT('%', LOWER(:term), '%') "
            + "OR LOWER(u.mbiemri) LIKE CONCAT('%', LOWER(:term), '%') "
            + "OR LOWER(u.email) LIKE CONCAT('%', LOWER(:term), '%'))")
    List<User> searchByRoleNormalizedNameAndTerm(String normalizedName, String term);
}
