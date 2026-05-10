package com.meson.config;

import com.meson.repository.UserRepository;
import com.meson.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;

@Component
@RequiredArgsConstructor
public class JwtFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final com.meson.repository.UserRoleRepository userRoleRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        // 1. Merr Authorization header
        String authHeader = request.getHeader("Authorization");

        // 2. Kontrollo nëse ka token
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // 3. Nxjerr token (hiq "Bearer ")
        String token = authHeader.substring(7);

        // 4. Nxjerr emailin dhe rolin nga token
        String email = jwtService.extractEmail(token);
        String tokenRole = jwtService.extractRole(token);

        // 5. Kontrollo nëse useri ekziston dhe nuk është autentifikuar
        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {

            // 6. Gjej userin nga DB
            var userOptional = userRepository.findByEmail(email);

            if (userOptional.isPresent() && jwtService.isTokenValid(token, email)) {
                
                // 7. Merr rolet nga token dhe krijo UserDetails
                var authorities = new java.util.ArrayList<org.springframework.security.core.GrantedAuthority>();
                if (tokenRole != null) {
                    authorities.add(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_" + tokenRole.toUpperCase()));
                }

                UserDetails userDetails = User.builder()
                        .username(email)
                        .password("")
                        .authorities(authorities)
                        .build();

                // 8. Krijo Authentication token
                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(
                                userDetails, null, userDetails.getAuthorities());

                authToken.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request));

                // 9. Vendos Authentication në SecurityContext
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        // 10. Vazhdo me kërkesën
        filterChain.doFilter(request, response);
    }
}