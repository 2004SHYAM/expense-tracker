package com.expensetracker.backend.security;

import java.util.List;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.security.web.SecurityFilterChain;

import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

@Configuration
public class SecurityConfig {

    // ------------------------------------------------------------------------------
    //  SECURITY FILTER CHAIN
    //  This is the core security configuration of Spring Security
    //  It controls:
    //      - what routes are allowed
    //      - which ones need authentication
    //      - CORS
    //      - CSRF disabling
    //      - login handlers
    // ------------------------------------------------------------------------------
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
            // ---------------------------------------------------------------
            // Disable CSRF because this is a stateless REST API
            // (frontend does NOT send CSRF tokens)
            // ---------------------------------------------------------------
            .csrf(csrf -> csrf.disable())

            // ---------------------------------------------------------------
            // Enable CORS using the bean defined below
            // ---------------------------------------------------------------
            .cors(Customizer.withDefaults())

            // ---------------------------------------------------------------
            // Define which endpoints require authentication
            // ---------------------------------------------------------------
            .authorizeHttpRequests(auth -> auth

                // Open endpoints — NO TOKEN REQUIRED
                .requestMatchers(
                        "/api/auth/**",        // login, register, reset password
                        "/api/team/create",     // anyone can create team
                        "/api/team/join",       // anyone can join using join code
                        "/api/expenses/**",     // all expense endpoints open
                        "/h2-console/**",       // H2 debug console
                        "/v3/api-docs/**",      // Swagger docs
                        "/swagger-ui/**",       // Swagger UI
                        "/api/auth/user/**"     // get user details
                ).permitAll()

                // Protected endpoint (requires JWT token)
                .requestMatchers("/api/team/expenses/me").authenticated()

                // Everything else is permitted
                .anyRequest().permitAll()
            )

            // ---------------------------------------------------------------
            // Disable default login page + disable basic authentication
            // because we use JWT + our own login API
            // ---------------------------------------------------------------
            .formLogin(form -> form.disable())
            .httpBasic(basic -> basic.disable());

        // ---------------------------------------------------------------
        // Allow frames for H2 console (otherwise it gets blocked)
        // ---------------------------------------------------------------
        http.headers(headers -> headers.frameOptions(frame -> frame.disable()));

        return http.build();
    }


    // ------------------------------------------------------------------------------
    //  PASSWORD ENCODER
    //  BCryptPasswordEncoder is the safest hashing algorithm for passwords.
    //  Used in registerUser(), resetPassword(), login checks, etc.
    // ------------------------------------------------------------------------------
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }


    // ------------------------------------------------------------------------------
    //  GLOBAL CORS CONFIGURATION
    //  Allows the React frontend (localhost:5173) to communicate with backend (8080)
    //  without CORS issues.
    // ------------------------------------------------------------------------------
    @Bean
    public CorsFilter corsFilter() {

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();

        // Allow frontend hosts
        config.setAllowedOriginPatterns(List.of(
                "http://localhost:5173",
                "http://127.0.0.1:5173"
        ));

        config.setAllowCredentials(true);               // allow cookies, auth headers, JWT
        config.setAllowedHeaders(List.of("*"));         // allow all header types
        config.setAllowedMethods(List.of(
                "GET", "POST", "PUT", "DELETE", "OPTIONS"
        ));                                            // allow common HTTP verbs

        // Apply CORS settings to all endpoints
        source.registerCorsConfiguration("/**", config);

        return new CorsFilter(source);
    }
}
