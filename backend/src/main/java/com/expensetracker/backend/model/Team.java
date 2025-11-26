package com.expensetracker.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * ----------------------------------------------------------------------------
 * Team
 * ----------------------------------------------------------------------------
 * This model represents a Team inside the Expense Tracker.
 *
 * A team groups multiple users together so they can:
 *   - Add shared expenses
 *   - Split bills
 *   - Track balances (who owes, who gets)
 *   - Join using a join code or a QR code
 *
 * This document is stored inside the MongoDB "teams" collection.
 * ----------------------------------------------------------------------------
 */
@Document(collection = "teams")
public class Team {

    /**
     * Auto-generated MongoDB document ID.
     */
    @Id
    private String id;

    /**
     * The name of the team (Example: "Trip 2025", "Office Lunch Group").
     */
    private String teamName;

    /**
     * The ID of the user who created the team.
     * Used for checking ownership or performing admin-level actions.
     */
    private String ownerId;

    /**
     * A unique join code that allows new members to join the team.
     * Example: "A1B2C3D4"
     */
    private String joinCode;

    /**
     * Timestamp of when the team was created.
     */
    private Instant createdAt;

    /**
     * A list of all the user IDs that belong to this team.
     */
    private List<String> memberIds = new ArrayList<>();

    // ----------------------------------------------------------------------
    // EXTRA FIELDS USED FOR SUMMARY SCREEN (TeamService)
    // These are NOT stored permanently for business logic.
    // They are set dynamically before sending responses to the frontend.
    // ----------------------------------------------------------------------

    /**
     * The name of the logged-in user (used in their personal team summary).
     */
    private String userName;

    /**
     * How much the current user still needs to pay inside this team.
     */
    private double needToPay;

    /**
     * How much the current user should receive from others inside this team.
     */
    private double needToGet;

    // ----------------------------------------------------------------------
    // GETTERS & SETTERS
    // ----------------------------------------------------------------------

    public String getId() { return id; }

    public String getTeamName() { return teamName; }
    public void setTeamName(String teamName) { this.teamName = teamName; }

    public String getOwnerId() { return ownerId; }
    public void setOwnerId(String ownerId) { this.ownerId = ownerId; }

    public String getJoinCode() { return joinCode; }
    public void setJoinCode(String joinCode) { this.joinCode = joinCode; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public List<String> getMemberIds() { return memberIds; }

    // ---------------- SUMMARY FIELDS ------------------

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public double getNeedToPay() { return needToPay; }
    public void setNeedToPay(double needToPay) { this.needToPay = needToPay; }

    public double getNeedToGet() { return needToGet; }
    public void setNeedToGet(double needToGet) { this.needToGet = needToGet; }
}
