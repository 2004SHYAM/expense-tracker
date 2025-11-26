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

    // ---------------------------- Dependency Injection ----------------------------
    private final UserRepository userRepository;                        // DB access for user login/register
    private final PasswordResetTokenRepository tokenRepository;         // DB access for password reset tokens
    private final EmailService emailService;                            // Utility for sending emails
    private final JwtService jwtService;                                // Utility for JWT generation

    // BCrypt used to hash passwords securely
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    // URL of your frontend — injected from application.properties
    @Value("${app.frontend.url}")
    private String appUrl;

    // ---------------------------- Constructor Injection ----------------------------
    public AuthController(UserRepository userRepository,
                          PasswordResetTokenRepository tokenRepository,
                          EmailService emailService,
                          JwtService jwtService) {

        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
        this.emailService = emailService;
        this.jwtService = jwtService;
    }

    // ==============================================================================
    // 1️⃣ REGISTER USER
    // ==============================================================================
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {

        // Validate required fields
        if (user.getEmail() == null || user.getPassword() == null) {
            return ResponseEntity.badRequest().body("Email and password are required");
        }

        // Check if email already exists
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Email already registered");
        }

        // Hash the password before storing it (NEVER store plain passwords)
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        // Save the new user document
        userRepository.save(user);

        return ResponseEntity.ok("User registered successfully!");
    }

    // ==============================================================================
    // 2️⃣ LOGIN USER
    // ==============================================================================
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody Map<String, String> request) {

        try {
            String email = request.get("email");
            String password = request.get("password");

            // Basic input validation
            if (email == null || password == null) {
                return ResponseEntity.badRequest().body("Email and password are required");
            }

            // Look up user by email
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(401).body("Invalid email or password");
            }

            User user = userOpt.get();

            // Verify password using BCrypt
            if (!passwordEncoder.matches(password, user.getPassword())) {
                return ResponseEntity.status(401).body("Invalid email or password");
            }

            // ---------------- SAFE NAME HANDLING ----------------
            // If the user has no first name (only email), create a friendly default
            if (user.getFirstName() == null || user.getFirstName().isBlank()) {

                String emailVal = user.getEmail();
                String emailPart = "User";

                if (emailVal != null && emailVal.contains("@")) {
                    // Extract text before @
                    emailPart = emailVal.substring(0, emailVal.indexOf("@"));
                }

                // Save as fallback display name
                user.setFirstName(emailPart);
                user.setLastName("");

                userRepository.save(user);
            }
            // -----------------------------------------------------

            // Generate JWT token with email as subject
            String token = jwtService.generateToken(email);

            // Build response body
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Login successful");
            response.put("token", token);
            response.put("userId", user.getId());
            response.put("email", user.getEmail());
            response.put("fullName", user.getFullName());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            // Print error for debugging
            e.printStackTrace();
            return ResponseEntity.status(500).body("Login failed: " + e.getMessage());
        }
    }

    // ==============================================================================
    // 3️⃣ FORGOT PASSWORD (Send email with token link)
    // ==============================================================================
    @PostMapping("/forgot-password")
    public String forgotPassword(@RequestParam String email) {

        // Always respond successfully, even if email does NOT exist
        // (prevents attackers from discovering valid emails)
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return "If the email exists, a reset link has been sent.";
        }

        // Generate unique reset token
        String token = UUID.randomUUID().toString();

        // Store token with 30 minute expiry
        PasswordResetToken resetToken =
                new PasswordResetToken(email, token, LocalDateTime.now().plusMinutes(30));

        tokenRepository.save(resetToken);

        // Build password reset link
        String resetLink = appUrl + "?token=" + token;
        String body = "Click here to reset your password: " + resetLink;

        // Send email
        emailService.sendEmail(email, "Password Reset", body);

        return "Password reset email sent!";
    }

    // ==============================================================================
    // 4️⃣ RESET PASSWORD (called after user clicks email link)
    // ==============================================================================
    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestBody ResetPasswordRequest request) {

        String token = request.getToken();
        String newPassword = request.getNewPassword();

        // Basic validation
        if (token == null || newPassword == null) {
            return ResponseEntity.badRequest().body("Token and new password are required");
        }

        // Check if token exists
        Optional<PasswordResetToken> tokenOpt = tokenRepository.findByToken(token);
        if (tokenOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Invalid token");
        }

        PasswordResetToken resetToken = tokenOpt.get();

        // Verify token expiry
        if (resetToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            return ResponseEntity.badRequest().body("Token expired");
        }

        // Find the user by email
        Optional<User> userOpt = userRepository.findByEmail(resetToken.getEmail());
        if (userOpt.isPresent()) {
            User user = userOpt.get();

            // Hash and update password
            user.setPassword(passwordEncoder.encode(newPassword));
            userRepository.save(user);
        }

        // Remove used token
        tokenRepository.delete(resetToken);

        return ResponseEntity.ok("Password reset successful");
    }

    // ==============================================================================
    // 5️⃣ GET USER NAME BY ID (used everywhere in your frontend)
    // ==============================================================================
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
