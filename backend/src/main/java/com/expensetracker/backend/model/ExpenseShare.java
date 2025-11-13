package com.expensetracker.backend.model;

public class ExpenseShare {
    private String userId;
    private double amount;
    private boolean paid;

    public ExpenseShare() {}

    public ExpenseShare(String userId, double amount, boolean paid) {
        this.userId = userId;
        this.amount = amount;
        this.paid = paid;
    }

    // Getters
    public String getUserId() { return userId; }
    public double getAmount() { return amount; }
    public boolean isPaid() { return paid; }

    // Setters
    public void setUserId(String userId) { this.userId = userId; }
    public void setAmount(double amount) { this.amount = amount; }
    public void setPaid(boolean paid) { this.paid = paid; }
}
