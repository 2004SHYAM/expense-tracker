package com.expensetracker.backend.controller;

import com.expensetracker.backend.dto.ResetPasswordRequest;
import com.expensetracker.backend.model.PasswordResetToken;
import com.expensetracker.backend.model.User;
import com.expensetracker.backend.repository.PasswordResetTokenRepository;
import com.expensetracker.backend.repository.UserRepository;
import com.expensetracker.backend.service.EmailService;
import com.expensetracker.backend.service.JwtService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/auth")

@CrossOrigin(origins = "*")

public class AuthController {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final EmailService emailService;
    private final JwtService jwtService;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Value("${app.frontend.url}")
    private String appUrl;

    public AuthController(UserRepository userRepository,
                          PasswordResetTokenRepository tokenRepository,
                          EmailService emailService,
                          JwtService jwtService) {
        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
        this.emailService = emailService;
        this.jwtService = jwtService;
    }

    // ============================================================
    // 1️⃣ REGISTER USER
    // ============================================================
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        if (user.getEmail() == null || user.getPassword() == null) {
            return ResponseEntity.badRequest().body("Email and password are required");
        }

        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Email already registered");
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userRepository.save(user);

        return ResponseEntity.ok("User registered successfully!");
    }

    // ============================================================
    // 2️⃣ LOGIN USER
    // ============================================================
    @PostMapping("/login")
public ResponseEntity<?> loginUser(@RequestBody Map<String, String> request) {
    try {
        String email = request.get("email");
        String password = request.get("password");

        if (email == null || password == null) {
            return ResponseEntity.badRequest().body("Email and password are required");
        }

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).body("Invalid email or password");
        }

        User user = userOpt.get();

        if (!passwordEncoder.matches(password, user.getPassword())) {
            return ResponseEntity.status(401).body("Invalid email or password");
        }

        // -------- SAFE NAME GENERATION ----------
        if (user.getFirstName() == null || user.getFirstName().isBlank()) {

            String emailVal = user.getEmail();
            String emailPart = "User";

            if (emailVal != null && emailVal.contains("@")) {
                emailPart = emailVal.substring(0, emailVal.indexOf("@"));
            }

            user.setFirstName(emailPart);
            user.setLastName("");
            userRepository.save(user);
        }
        // -----------------------------------------

        String token = jwtService.generateToken(email);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Login successful");
        response.put("token", token);
        response.put("userId", user.getId());
        response.put("email", user.getEmail());
        response.put("fullName", user.getFullName());

        return ResponseEntity.ok(response);

    } catch (Exception e) {
        e.printStackTrace(); // prints the real error in console
        return ResponseEntity.status(500).body("Login failed: " + e.getMessage());
    }
}


    // ============================================================
    // 3️⃣ FORGOT PASSWORD 
    // ============================================================
    @PostMapping("/forgot-password")
    public String forgotPassword(@RequestParam String email) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return "If the email exists, a reset link has been sent.";
        }

        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = new PasswordResetToken(email, token, LocalDateTime.now().plusMinutes(30));
        tokenRepository.save(resetToken);

        String resetLink = appUrl + "?token=" + token;
        String body = "Click here to reset your password: " + resetLink;

        emailService.sendEmail(email, "Password Reset", body);
        return "Password reset email sent!";
    }

    // ============================================================
    // 4️⃣ RESET PASSWORD 
    // ============================================================
    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestBody ResetPasswordRequest request) {
        String token = request.getToken();
        String newPassword = request.getNewPassword();

        if (token == null || newPassword == null) {
            return ResponseEntity.badRequest().body("Token and new password are required");
        }

        Optional<PasswordResetToken> tokenOpt = tokenRepository.findByToken(token);
        if (tokenOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Invalid token");
        }

        PasswordResetToken resetToken = tokenOpt.get();
        if (resetToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            return ResponseEntity.badRequest().body("Token expired");
        }

        Optional<User> userOpt = userRepository.findByEmail(resetToken.getEmail());
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setPassword(passwordEncoder.encode(newPassword)); // Hash it for security
            userRepository.save(user);
        }

        tokenRepository.delete(resetToken);
        return ResponseEntity.ok("Password reset successful");
    }

    @GetMapping("/user/{userId}")
public ResponseEntity<?> getUserNameById(@PathVariable String userId) {
    try {
        Optional<User> userOpt = userRepository.findById(userId);

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body("User not found");
        }

        User user = userOpt.get();

        Map<String, Object> response = new HashMap<>();
        response.put("userId", user.getId());
        response.put("fullName", user.getFullName());

        return ResponseEntity.ok(response);

    } catch (Exception e) {
        return ResponseEntity.status(500).body("Error: " + e.getMessage());
    }
}

}
