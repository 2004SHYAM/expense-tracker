package com.expensetracker.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * ----------------------------------------------------------------------------
 * Expense Document (MongoDB)
 * ----------------------------------------------------------------------------
 * This class represents a single expense inside a team.
 *
 * Every expense includes:
 *  - Who paid (paidByUserId)
 *  - Total amount
 *  - Description
 *  - Time/date
 *  - A list of shares (ExpenseShare objects), one for each member
 * ----------------------------------------------------------------------------
 */
@Document(collection = "expenses")
public class Expense {

    /**
     * MongoDB document ID
     */
    @Id
    private String id;

    /**
     * The team this expense belongs to.
     */
    private String teamId;

    /**
     * Human-readable description of the purchase.
     * Example: "Dinner", "Uber Ride", "Groceries"
     */
    private String description;

    /**
     * Total amount spent for this expense.
     */
    private double amount;

    /**
     * ID of the user who paid the expense.
     */
    private String paidByUserId;

    /**
     * Timestamp storing when the expense was created.
     */
    private Instant date;

    /**
     * List of ExpenseShare objects.
     * Each share contains:
     *  - which member owes how much
     *  - payment status (UNPAID / PENDING / APPROVED / REJECTED)
     *  - proof image for UPI
     *  - payment method
     */
    private List<ExpenseShare> shares = new ArrayList<>();

    /**
     * Default constructor required by Spring and MongoDB.
     */
    public Expense() {}

    // ------------------------------------------------------------------------
    // GETTERS
    // ------------------------------------------------------------------------

    public String getId() {
        return id;
    }

    public String getTeamId() {
        return teamId;
    }

    public String getDescription() {
        return description;
    }

    public double getAmount() {
        return amount;
    }

    public String getPaidByUserId() {
        return paidByUserId;
    }

    public Instant getDate() {
        return date;
    }

    public List<ExpenseShare> getShares() {
        return shares;
    }

    // ------------------------------------------------------------------------
    // SETTERS
    // ------------------------------------------------------------------------

    public void setId(String id) {
        this.id = id;
    }

    public void setTeamId(String teamId) {
        this.teamId = teamId;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setAmount(double amount) {
        this.amount = amount;
    }

    public void setPaidByUserId(String paidByUserId) {
        this.paidByUserId = paidByUserId;
    }

    public void setDate(Instant date) {
        this.date = date;
    }

    public void setShares(List<ExpenseShare> shares) {
        this.shares = shares;
    }
}
