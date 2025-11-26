package com.expensetracker.backend.model;

/**
 * ----------------------------------------------------------------------------
 * ExpenseShare
 * ----------------------------------------------------------------------------
 * Represents ONE PERSON'S share of a team expense.
 *
 * For every Expense:
 *  - There is one ExpenseShare entry per user in the team.
 *  - This tracks how much they owe and whether they paid it.
 *
 * Fields include:
 *  - userId: who owes this share
 *  - amount: how much they owe
 *  - paymentMethod: CASH or UPI
 *  - proofImage: base64 screenshot for UPI payment
 *  - status: payment approval workflow
 *  - payeeId: optional field to track who should receive money
 * ----------------------------------------------------------------------------
 */
public class ExpenseShare {

    /**
     * ID of the user assigned to this share.
     */
    private String userId;

    /**
     * Amount this user must pay for the expense.
     */
    private double amount;

    /**
     * How the user paid:
     *   - CASH
     *   - UPI
     *   - null (if not yet submitted)
     */
    private String paymentMethod;

    /**
     * UPI screenshot (stored as base64 string).
     * Only required if paymentMethod = UPI.
     */
    private String proofImage;

    /**
     * Status of the payment workflow.
     *
     * Possible values:
     *  - UNPAID (default)
     *  - PENDING_CASH_APPROVAL
     *  - PENDING_UPI_APPROVAL
     *  - APPROVED
     *  - REJECTED
     */
    private String status;

    /**
     * Optional:
     * ID of the person who should receive this payment.
     * (Usually the payer of the expense.)
     */
    private String payeeId;

    /**
     * Default constructor.
     * Sets status to "UNPAID" by default.
     * Required by Spring + MongoDB.
     */
    public ExpenseShare() {
        this.status = "UNPAID";
    }

    /**
     * Constructor used when creating a new expense.
     * If the user is the payer, they are automatically marked as APPROVED.
     */
    public ExpenseShare(String userId, double amount, boolean isPayer) {
        this.userId = userId;
        this.amount = amount;
        this.status = isPayer ? "APPROVED" : "UNPAID";
    }

    // ------------------------------------------------------------------------
    // GETTERS / SETTERS
    // ------------------------------------------------------------------------

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public double getAmount() {
        return amount;
    }

    public void setAmount(double amount) {
        this.amount = amount;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getProofImage() {
        return proofImage;
    }

    public void setProofImage(String proofImage) {
        this.proofImage = proofImage;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getPayeeId() {
        return payeeId;
    }

    public void setPayeeId(String payeeId) {
        this.payeeId = payeeId;
    }

    /**
     * Backward compatible method.
     * Some older code uses setUpiScreenshot() instead of setProofImage().
     * We map it internally to proofImage.
     */
    public void setUpiScreenshot(String proofImage) {
        setProofImage(proofImage);
    }

    @Override
    public String toString() {
        return "ExpenseShare{" +
                "userId='" + userId + '\'' +
                ", amount=" + amount +
                ", paymentMethod='" + paymentMethod + '\'' +
                ", proofImage='" + proofImage + '\'' +
                ", status='" + status + '\'' +
                ", payeeId='" + payeeId + '\'' +
                '}';
    }
}
