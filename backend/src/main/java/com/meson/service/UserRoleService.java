package com.meson.service;

import com.meson.dto.UserRoleRequest;
import com.meson.dto.UserRoleResponse;
import com.meson.entity.Role;
import com.meson.entity.User;
import com.meson.entity.UserRole;
import com.meson.repository.RoleRepository;
import com.meson.repository.UserRepository;
import com.meson.repository.UserRoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserRoleService {

    private final UserRoleRepository userRoleRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    public UserRoleResponse assingRole(UserRoleRequest request) {

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("Useri nuk u gjet"));

        Role role = roleRepository.findById(request.getRoleId())
                .orElseThrow(() -> new RuntimeException("Roli nuk u gjet"));

        if (userRoleRepository.existsByUserAndRole(user, role)) {
            throw new RuntimeException("Useri e ka tashme kete rol");
        }

        UserRole userRole = new UserRole();
        userRole.setUser(user);
        userRole.setRole(role);

        return toResponse(userRoleRepository.save(userRole));
    }

    public List<UserRoleResponse>getUserRoles(Long userId){

        User user = userRepository.findById(userId)
                .orElseThrow(()->new RuntimeException("Useri nuk u gjet"));

        return userRoleRepository.findByUser(user)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public void removeRole(Long id){

        if(!userRoleRepository.existsById(id)){
            throw new RuntimeException("Lidhja nuk u gjet");
        }

        userRoleRepository.deleteById(id);
    }

    private UserRoleResponse toResponse (UserRole userRole){
        UserRoleResponse response = new UserRoleResponse();
        response.setId(userRole.getId());
        response.setEmri(userRole.getUser().getEmri());
        response.setMbiemri(userRole.getUser().getMbiemri());
        response.setEmail(userRole.getUser().getEmail());
        response.setRole(userRole.getRole().getEmertimi());
        return response;
    }

}
