package com.expensetracker.backend.service;

import com.expensetracker.backend.model.Expense;
import com.expensetracker.backend.model.ExpenseShare;
import com.expensetracker.backend.model.Team;
import com.expensetracker.backend.model.User;
import com.expensetracker.backend.repository.ExpenseRepository;
import com.expensetracker.backend.repository.TeamRepository;
import com.expensetracker.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * ---------------------------------------------------------------------------
 * TeamService
 * ---------------------------------------------------------------------------
 * This service provides backend logic for team-related operations.
 *
 * The key feature in this file:
 *   ✔ Calculate how much a user needs to pay or receive in each team.
 *
 * The method getTeamExpensesForUser():
 *   - Reads all teams the user is part of
 *   - Fetches all expenses inside each team
 *   - Reads each expense share and calculates:
 *         • needToPay → money the user still owes
 *         • needToGet → money the user should receive
 *
 * This data is used on the frontend to show team-level summaries.
 * ---------------------------------------------------------------------------
 */
@Service
public class TeamService {

    // Inject Team Repository
    @Autowired
    private TeamRepository teamRepo;

    // Inject User Repository
    @Autowired
    private UserRepository userRepo;

    // Inject Expense Repository
    @Autowired
    private ExpenseRepository expenseRepo;

    /**
     * Calculates the needToPay and needToGet amounts for a user
     * in all the teams they are a member of.
     *
     * @param userId the currently logged-in user
     * @return List<Team> enriched with needToPay / needToGet fields
     */
    public List<Team> getTeamExpensesForUser(String userId) {

        // This list will store all teams with calculated summary
        List<Team> list = new ArrayList<>();

        // Fetch user by ID. If not found, return empty list.
        Optional<User> userOpt = userRepo.findById(userId);
        if (userOpt.isEmpty()) return list;

        User user = userOpt.get();

        // Loop through all team IDs the user belongs to
        for (String teamId : user.getTeamIds()) {

            // Fetch the actual team document from DB
            Optional<Team> teamOpt = teamRepo.findById(teamId);
            if (teamOpt.isEmpty()) continue; // skip invalid teams

            Team team = teamOpt.get();

            // Fetch all expenses belonging to this team
            List<Expense> expenses = expenseRepo.findByTeamId(teamId);

            // Track total amounts the user owes or should receive
            double needToPay = 0;
            double needToGet = 0;

            // Process each expense inside the team
            for (Expense exp : expenses) {

                String paidBy = exp.getPaidByUserId(); // The person who paid the whole bill

                // Loop through every member's share
                for (ExpenseShare s : exp.getShares()) {

                    // If status is null (older expenses), treat as UNPAID
                    String status = s.getStatus();
                    if (status == null) status = "UNPAID";

                    boolean isApproved = "APPROVED".equals(status);

                    // -------------------------------------------------------
                    // CASE 1: USER NEEDS TO PAY (owes money)
                    // Conditions:
                    // - user is not the payer
                    // - user is the share owner
                    // - payment not approved yet
                    // -------------------------------------------------------
                    if (!s.getUserId().equals(paidBy)     // This user isn't the payer
                            && s.getUserId().equals(userId) // This share belongs to this user
                            && !isApproved) {                // Still pending
                        needToPay += s.getAmount();
                    }

                    // -------------------------------------------------------
                    // CASE 2: USER NEEDS TO GET (should receive)
                    // Conditions:
                    // - user is the payer
                    // - another member owes money
                    // - payment for that share is not yet approved
                    // -------------------------------------------------------
                    if (paidBy.equals(userId)                // user paid entire expense
                            && !s.getUserId().equals(userId) // another member
                            && !isApproved) {                // still pending
                        needToGet += s.getAmount();
                    }
                }
            }

            // Set summary fields inside Team object so frontend can read them
            team.setUserName(user.getFullName());
            team.setNeedToPay(Math.round(needToPay * 100.0) / 100.0); // round to 2 decimals
            team.setNeedToGet(Math.round(needToGet * 100.0) / 100.0);

            // Add team to final output
            list.add(team);
        }

        return list;
    }
}
