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

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import jakarta.servlet.http.HttpServletRequest;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.Instant;
import java.util.*;

@RestController
@RequestMapping("/api/team")
@CrossOrigin(origins = "*")
public class TeamController {

    @Autowired
    private TeamRepository teamRepo;

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private TeamService teamService;

    @Autowired
    private JwtService jwtService;

    private String getEmailFromToken(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) return null;
        String token = header.substring(7);
        return jwtService.extractEmail(token);
    }

    // -----------------------------------------------------
    // 1️⃣ CREATE TEAM
    // -----------------------------------------------------

    @PostMapping("/create")
    public ResponseEntity<?> createTeam(@RequestBody Map<String, String> payload)
            throws WriterException, IOException {

        String teamName = payload.get("teamName");
        String email = payload.get("email");

        if (teamName == null || teamName.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Team name cannot be empty");
        }

        Optional<User> userOpt = userRepo.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("User not found");
        }

        User user = userOpt.get();

        Team team = new Team();
        team.setTeamName(teamName);
        team.setCreatedAt(Instant.now());

        String joinCode = new ObjectId().toHexString().substring(0, 8).toUpperCase();
        team.setJoinCode(joinCode);

        // Add creator
        team.getMemberIds().add(user.getId());
        teamRepo.save(team);

        // Add team to user
        user.addTeamId(team.getId());
        userRepo.save(user);

        // Generate QR
        QRCodeWriter qrWriter = new QRCodeWriter();
        var matrix = qrWriter.encode(joinCode, BarcodeFormat.QR_CODE, 250, 250);

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        MatrixToImageWriter.writeToStream(matrix, "PNG", out);
        String base64QR = Base64.getEncoder().encodeToString(out.toByteArray());

        Map<String, Object> response = new HashMap<>();
        response.put("teamId", team.getId());
        response.put("teamName", teamName);
        response.put("joinCode", joinCode);
        response.put("qrBase64", base64QR);

        return ResponseEntity.ok(response);
    }

    // -----------------------------------------------------
    // 2️⃣ JOIN TEAM
    // -----------------------------------------------------

    @PostMapping("/join")
    public ResponseEntity<?> joinTeam(@RequestParam String joinCode, @RequestParam String email) {

        Optional<Team> teamOpt = teamRepo.findByJoinCode(joinCode);
        if (teamOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Invalid join code");
        }

        Optional<User> userOpt = userRepo.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("User not found");
        }

        Team team = teamOpt.get();
        User user = userOpt.get();

        // Add user to team
        if (!team.getMemberIds().contains(user.getId())) {
            team.getMemberIds().add(user.getId());
            teamRepo.save(team);
        }

        // Add team to user
        user.addTeamId(team.getId());
        userRepo.save(user);

        return ResponseEntity.ok("Joined team successfully!");
    }

    // -----------------------------------------------------
    // 3️⃣ FETCH TEAM EXPENSES SUMMARY
    // -----------------------------------------------------

    @GetMapping("/user/{userId}/expenses")
    public ResponseEntity<?> getUserTeamExpenses(@PathVariable String userId) {
        try {
            return ResponseEntity.ok(teamService.getTeamExpensesForUser(userId));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error: " + e.getMessage());
        }
    }

    // -----------------------------------------------------
    // 4️⃣ GET TEAM DETAILS
    // -----------------------------------------------------

    @GetMapping("/{teamId}")
    public ResponseEntity<?> getTeam(@PathVariable String teamId) {
        return teamRepo.findById(teamId)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.badRequest().body("Team not found"));
    }

    // -----------------------------------------------------
    // 5️⃣ GET ALL TEAMS
    // -----------------------------------------------------

    @GetMapping("/all")
    public ResponseEntity<?> getAllTeams() {
        return ResponseEntity.ok(teamRepo.findAll());
    }



   @GetMapping("/my-teams/{userId}")
public ResponseEntity<?> getUserTeams(@PathVariable String userId) {

    Optional<User> userOpt = userRepo.findById(userId);
    if (userOpt.isEmpty()) {
        return ResponseEntity.badRequest().body("User not found");
    }

    User user = userOpt.get();

    List<Team> teams = teamRepo.findAllById(user.getTeamIds());

    return ResponseEntity.ok(teams);
}

        // ---------- QR CODE GENERATION ----------
        public byte[] generateTeamQr(String teamId) {
            try {
                String qrText = "http://localhost:5173/join-team/" + teamId;

                QRCodeWriter qrCodeWriter = new QRCodeWriter();
                BitMatrix bitMatrix = qrCodeWriter.encode(qrText, BarcodeFormat.QR_CODE, 300, 300);

                ByteArrayOutputStream pngOutput = new ByteArrayOutputStream();
                MatrixToImageWriter.writeToStream(bitMatrix, "PNG", pngOutput);

                return pngOutput.toByteArray();
            } catch (WriterException | IOException e) {
                throw new RuntimeException("Failed to generate QR code", e);
            }
        }

        @GetMapping("/team/{teamId}/qr")
        public ResponseEntity<byte[]> getTeamQr(@PathVariable String teamId) {

            byte[] qrImage = generateTeamQr(teamId);

            HttpHeaders headers = new HttpHeaders();
            headers.set(HttpHeaders.CONTENT_TYPE, "image/png");

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(qrImage);
        }

}
