package com.meson.repository;

import com.meson.entity.User;
import com.meson.entity.Role;
import com.meson.entity.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserRoleRepository extends JpaRepository<UserRole, Long> {
    List<UserRole> findByUser(User user);

    List<UserRole> findByRole(Role role);

    boolean existsByUserAndRole(User user, Role role);

    java.util.Optional<UserRole> findByUserAndRole(User user, Role role);
}