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

    // ----------------------------
    // Dependency Injection
    // ----------------------------
    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final EmailService emailService;
    private final JwtService jwtService;

    // BCrypt for hashing passwords
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    // Frontend URL from application.properties
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

    // ============================================================================
    // 1️⃣ REGISTER USER
    // ============================================================================
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {

        // Validate mandatory fields
        if (user.getEmail() == null || user.getPassword() == null) {
            return ResponseEntity.badRequest().body("Email and password are required");
        }

        // Email duplicate check
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Email already registered");
        }

        // Hash password before saving
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        userRepository.save(user);

        return ResponseEntity.ok("User registered successfully!");
    }

    // ============================================================================
    // 2️⃣ LOGIN USER – returns JWT + user details
    // ============================================================================
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

            // Validate password
            if (!passwordEncoder.matches(password, user.getPassword())) {
                return ResponseEntity.status(401).body("Invalid email or password");
            }

            // Auto-fill name if empty (fallback name from email)
            if (user.getFirstName() == null || user.getFirstName().isBlank()) {
                String name = email.contains("@") ? email.substring(0, email.indexOf("@")) : "User";
                user.setFirstName(name);
                user.setLastName("");
                userRepository.save(user);
            }

            // Generate JWT token
            String token = jwtService.generateToken(email);

            // Return essential details
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Login successful");
            response.put("token", token);
            response.put("userId", user.getId());
            response.put("email", user.getEmail());
            response.put("fullName", user.getFullName());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(500).body("Login failed: " + e.getMessage());
        }
    }

    // ============================================================================
    // 3️⃣ FORGOT PASSWORD – sends reset link to email
    // ============================================================================
    @PostMapping("/forgot-password")
    public String forgotPassword(@RequestParam String email) {

        Optional<User> userOpt = userRepository.findByEmail(email);

        // Always return true to avoid account discovery attacks
        if (userOpt.isEmpty()) {
            return "If the email exists, a reset link has been sent.";
        }

        // Create password reset token
        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken =
                new PasswordResetToken(email, token, LocalDateTime.now().plusMinutes(30));

        tokenRepository.save(resetToken);

        // Build reset link
        String resetLink = appUrl + "?token=" + token;

        emailService.sendEmail(email, "Password Reset",
                "Click here to reset your password: " + resetLink);

        return "Password reset email sent!";
    }

    // ============================================================================
    // 4️⃣ RESET PASSWORD after clicking email link
    // ============================================================================
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {

        Optional<PasswordResetToken> tokenOpt =
                tokenRepository.findByToken(request.getToken());

        if (tokenOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Invalid token");
        }

        PasswordResetToken token = tokenOpt.get();

        // Check expiry
        if (token.getExpiryDate().isBefore(LocalDateTime.now())) {
            return ResponseEntity.badRequest().body("Token expired");
        }

        // Update user password
        Optional<User> userOpt = userRepository.findByEmail(token.getEmail());
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setPassword(passwordEncoder.encode(request.getNewPassword()));
            userRepository.save(user);
        }

        tokenRepository.delete(token);

        return ResponseEntity.ok("Password reset successful");
    }

    // ============================================================================
    // 5️⃣ GET FULL USER PROFILE BY ID  (Single Correct Endpoint)
    // ============================================================================
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserProfile(@PathVariable String userId) {

        Optional<User> userOpt = userRepository.findById(userId);

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body("User not found");
        }

        User user = userOpt.get();

        Map<String, Object> response = new HashMap<>();
        response.put("userId", user.getId());
        response.put("email", user.getEmail());
        response.put("firstName", user.getFirstName());
        response.put("lastName", user.getLastName());
        response.put("phone", user.getPhone());
        response.put("profileImage", user.getProfileImage());    // Base64 string
        response.put("teamIds", user.getTeamIds());

        return ResponseEntity.ok(response);
    }

    // ============================================================================
    // 6️⃣ UPDATE USER PROFILE FIELDS (image, phone, names)
    // ============================================================================
    @PutMapping("/user/{userId}")
    public ResponseEntity<?> updateUserProfile(
            @PathVariable String userId,
            @RequestBody Map<String, Object> body) {

        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body("User not found");
        }

        User user = userOpt.get();

        // Update only provided fields
        if (body.containsKey("firstName")) user.setFirstName((String) body.get("firstName"));
        if (body.containsKey("lastName")) user.setLastName((String) body.get("lastName"));
        if (body.containsKey("phone")) user.setPhone((String) body.get("phone"));
        if (body.containsKey("profileImage")) user.setProfileImage((String) body.get("profileImage"));

        userRepository.save(user);

        return ResponseEntity.ok("Profile updated successfully");
    }
}
