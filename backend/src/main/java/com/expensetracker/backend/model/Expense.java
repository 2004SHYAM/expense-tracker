package com.expensetracker.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "expenses")
public class Expense {
    @Id
    private String id;
    private String teamId;
    private String description;
    private double amount;
    private String paidByUserId;
    private Instant date;
    private List<ExpenseShare> shares = new ArrayList<>();

    public Expense() {}

    // Getters
    public String getId() { return id; }
    public String getTeamId() { return teamId; }
    public String getDescription() { return description; }
    public double getAmount() { return amount; }
    public String getPaidByUserId() { return paidByUserId; }
    public Instant getDate() { return date; }
    public List<ExpenseShare> getShares() { return shares; }

    // Setters
    public void setId(String id) { this.id = id; }
    public void setTeamId(String teamId) { this.teamId = teamId; }
    public void setDescription(String description) { this.description = description; }
    public void setAmount(double amount) { this.amount = amount; }
    public void setPaidByUserId(String paidByUserId) { this.paidByUserId = paidByUserId; }
    public void setDate(Instant date) { this.date = date; }
    public void setShares(List<ExpenseShare> shares) { this.shares = shares; }
}
