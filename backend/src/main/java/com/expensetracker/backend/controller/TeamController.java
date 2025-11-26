package com.expensetracker.backend.controller;

import com.expensetracker.backend.model.Team;
import com.expensetracker.backend.model.User;
import com.expensetracker.backend.repository.TeamRepository;
import com.expensetracker.backend.repository.UserRepository;
import com.expensetracker.backend.service.JwtService;
import com.expensetracker.backend.service.TeamService;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.MultiFormatWriter;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;

import jakarta.servlet.http.HttpServletRequest;

import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.Instant;
import java.util.*;

@RestController
@RequestMapping("/api/team")
@CrossOrigin(origins = "*")     // Allow frontend to call this API
public class TeamController {

    // ----------------------------------------------------
    // Inject MongoDB Repositories + Services
    // ----------------------------------------------------
    
    @Autowired
    private TeamRepository teamRepo;     // Used to read/write team documents in MongoDB

    @Autowired
    private UserRepository userRepo;     // Used to read/write user documents

    @Autowired
    private TeamService teamService;     // Business logic such as per-team expense summaries

    @Autowired
    private JwtService jwtService;       // Helps extract data from JWT tokens

    
    // ----------------------------------------------------
    // Helper: Extract email from Bearer Token
    // ----------------------------------------------------
    private String getEmailFromToken(HttpServletRequest request) {
        String header = request.getHeader("Authorization");

        // If no header or header doesn't start with "Bearer "
        if (header == null || !header.startsWith("Bearer "))
            return null;

        // Extract only the token part
        String token = header.substring(7);

        // Extract email inside token
        return jwtService.extractEmail(token);
    }


    // ====================================================
    // 1️⃣ CREATE TEAM
    // ====================================================
    @PostMapping("/create")
    public ResponseEntity<?> createTeam(@RequestBody Map<String, String> payload)
            throws WriterException, IOException {

        // Extract inputs sent from frontend
        String teamName = payload.get("teamName");
        String email = payload.get("email");

        // Team must have name
        if (teamName == null || teamName.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Team name cannot be empty");
        }

        // Check if creator actually exists
        Optional<User> userOpt = userRepo.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("User not found");
        }

        User user = userOpt.get();

        // Create new team object
        Team team = new Team();
        team.setTeamName(teamName);
        team.setCreatedAt(Instant.now());

        // Create 8-character random join code (like ABCD1234)
        String joinCode = new ObjectId().toHexString().substring(0, 8).toUpperCase();
        team.setJoinCode(joinCode);

        // Add creator as first member
        team.getMemberIds().add(user.getId());
        teamRepo.save(team);

        // Add this team to user's list
        user.addTeamId(team.getId());
        userRepo.save(user);

        // ------------------------
        // Generate QR code
        // ------------------------

        QRCodeWriter qrWriter = new QRCodeWriter();

        // Create 250×250 QR
        BitMatrix matrix = qrWriter.encode(joinCode, BarcodeFormat.QR_CODE, 250, 250);

        // Convert QR → image → base64 so frontend can show it
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        MatrixToImageWriter.writeToStream(matrix, "PNG", out);
        String base64QR = Base64.getEncoder().encodeToString(out.toByteArray());

        // Build JSON response
        Map<String, Object> response = new HashMap<>();
        response.put("teamId", team.getId());
        response.put("teamName", teamName);
        response.put("joinCode", joinCode);
        response.put("qrBase64", base64QR);

        return ResponseEntity.ok(response);
    }


    // ====================================================
    // 2️⃣ JOIN TEAM
    // ====================================================
    @PostMapping("/join")
    public ResponseEntity<?> joinTeam(@RequestParam String joinCode, @RequestParam String email) {

        // Find team using joinCode
        Optional<Team> teamOpt = teamRepo.findByJoinCode(joinCode);
        if (teamOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Invalid join code");
        }

        // Find user using email
        Optional<User> userOpt = userRepo.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("User not found");
        }

        Team team = teamOpt.get();
        User user = userOpt.get();

        // If user is not already inside team
        if (!team.getMemberIds().contains(user.getId())) {
            team.getMemberIds().add(user.getId());
            teamRepo.save(team);
        }

        // Add teamId inside user's record
        user.addTeamId(team.getId());
        userRepo.save(user);

        return ResponseEntity.ok("Joined team successfully!");
    }


    // ====================================================
    // 3️⃣ TEAM EXPENSES SUMMARY PER USER
    // ====================================================
    @GetMapping("/user/{userId}/expenses")
    public ResponseEntity<?> getUserTeamExpenses(@PathVariable String userId) {
        try {
            // Delegated to TeamService (your custom logic)
            return ResponseEntity.ok(teamService.getTeamExpensesForUser(userId));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error: " + e.getMessage());
        }
    }


    // ====================================================
    // 4️⃣ GET TEAM DETAILS
    // ====================================================
    @GetMapping("/{teamId}")
    public ResponseEntity<?> getTeam(@PathVariable String teamId) {

        // Return team or 400 error
        return teamRepo.findById(teamId)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.badRequest().body("Team not found"));
    }


    // ====================================================
    // 5️⃣ GET ALL TEAMS (admin/debug)
    // ====================================================
    @GetMapping("/all")
    public ResponseEntity<?> getAllTeams() {
        return ResponseEntity.ok(teamRepo.findAll());
    }


    // ====================================================
    // 6️⃣ GET ALL TEAMS WHERE USER IS MEMBER
    // ====================================================
    @GetMapping("/my-teams/{userId}")
    public ResponseEntity<?> getUserTeams(@PathVariable String userId) {

        Optional<User> userOpt = userRepo.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("User not found");
        }

        User user = userOpt.get();

        // Fetch all teams matching user's teamIds list
        List<Team> teams = teamRepo.findAllById(user.getTeamIds());

        return ResponseEntity.ok(teams);
    }


    // ====================================================
    // 7️⃣ QR CODE GENERATION (URL-based)
    // ====================================================
    public byte[] generateTeamQr(String teamId) {
        try {
            // The QR code will open join link in frontend
            String qrText = "http://localhost:5173/join-team/" + teamId;

            // Generate 300×300 QR matrix
            QRCodeWriter qrCodeWriter = new QRCodeWriter();
            BitMatrix bitMatrix = qrCodeWriter.encode(qrText, BarcodeFormat.QR_CODE, 300, 300);

            // Convert QR to PNG bytes
            ByteArrayOutputStream pngOutput = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(bitMatrix, "PNG", pngOutput);

            return pngOutput.toByteArray();

        } catch (WriterException | IOException e) {
            throw new RuntimeException("Failed to generate QR code", e);
        }
    }


    // ====================================================
    // 8️⃣ GET QR CODE IMAGE FOR TEAM
    // ====================================================
    @GetMapping("/team/{teamId}/qr")
    public ResponseEntity<byte[]> getTeamQr(@PathVariable String teamId) {

        // Generate PNG QR bytes
        byte[] qrImage = generateTeamQr(teamId);

        // HTTP header: inform browser this is PNG
        HttpHeaders headers = new HttpHeaders();
        headers.set(HttpHeaders.CONTENT_TYPE, "image/png");

        return ResponseEntity.ok()
                .headers(headers)
                .body(qrImage);
    }

}
