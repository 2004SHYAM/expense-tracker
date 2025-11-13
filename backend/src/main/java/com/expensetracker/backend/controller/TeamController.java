package com.expensetracker.backend.controller;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.Instant;
import java.util.Base64;
import java.util.Optional;

import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.expensetracker.backend.model.Team;
import com.expensetracker.backend.model.User;
import com.expensetracker.backend.repository.TeamRepository;
import com.expensetracker.backend.repository.UserRepository;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.qrcode.QRCodeWriter;

@RestController
@RequestMapping("/api/team")
@CrossOrigin(origins = "*")
public class TeamController {

    @Autowired
    private TeamRepository teamRepo;

    @Autowired
    private UserRepository userRepo;

    /**
     * ✅ Create a new team for a user and return a Base64 QR code for joining.
     */
    @PostMapping("/create")
    public ResponseEntity<?> createTeam(@RequestParam String teamName, @RequestParam String email)
            throws WriterException, IOException {

        // Validate input
        if (teamName == null || teamName.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Team name cannot be empty");
        }

        Optional<User> userOpt = userRepo.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("User not found for email: " + email);
        }

        User user = userOpt.get();

        // ✅ Create new team
        Team team = new Team();
        team.setTeamName(teamName);
        team.setCreatedAt(Instant.now());
        team.setOwnerId(user.getId());

        // ✅ Generate short random join code (8 characters)
        String joinCode = new ObjectId().toHexString().substring(0, 8).toUpperCase();
        team.setJoinCode(joinCode);

        // ✅ Add creator as first member
        team.getMemberIds().add(user.getId());

        // ✅ Save team
        teamRepo.save(team);

        // ✅ Link user to this team
        user.setTeamId(team.getId());
        userRepo.save(user);

        // ✅ Generate QR Code as Base64
        QRCodeWriter qrCodeWriter = new QRCodeWriter();
        var bitMatrix = qrCodeWriter.encode(joinCode, BarcodeFormat.QR_CODE, 250, 250);

        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            MatrixToImageWriter.writeToStream(bitMatrix, "PNG", outputStream);
            String base64 = Base64.getEncoder().encodeToString(outputStream.toByteArray());
            return ResponseEntity.ok("Team created successfully! QR Code (Base64): " + base64);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("Failed to generate QR code: " + e.getMessage());
        }
    }

    /**
     * ✅ Join an existing team using its join code and user email.
     */
    @PostMapping("/join")
    public ResponseEntity<String> joinTeam(@RequestParam String joinCode, @RequestParam String email) {

        Optional<Team> teamOpt = teamRepo.findByJoinCode(joinCode);
        if (teamOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Invalid join code");
        }

        Optional<User> userOpt = userRepo.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("User not found for email: " + email);
        }

        Team team = teamOpt.get();
        User user = userOpt.get();

        // ✅ Add user to team if not already a member
        if (!team.getMemberIds().contains(user.getId())) {
            team.getMemberIds().add(user.getId());
            teamRepo.save(team);
        }

        // ✅ Link user to team
        user.setTeamId(team.getId());
        userRepo.save(user);

        return ResponseEntity.ok("Successfully joined team: " + team.getTeamName());
    }

    /**
     * ✅ Fetch details of a specific team
     */
    @GetMapping("/{teamId}")
    public ResponseEntity<?> getTeam(@PathVariable String teamId) {
        return teamRepo.findById(teamId)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.badRequest().body("Team not found"));
    }

    /**
     * ✅ List all teams (for admin or debugging)
     */
    @GetMapping("/all")
    public ResponseEntity<?> getAllTeams() {
        return ResponseEntity.ok(teamRepo.findAll());
    }
}
