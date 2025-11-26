package com.expensetracker.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

/**
 * ----------------------------------------------------------------------------
 * PasswordResetToken
 * ----------------------------------------------------------------------------
 * This model stores password-reset tokens issued when a user clicks "Forgot
 * Password".
 *
 * Why this exists:
 *  - When a user requests a password reset, we generate a random token.
 *  - We email that token to the user as a link.
 *  - The token is saved here so we can validate it later.
 *
 * Fields stored:
 *  - id          : MongoDB document ID.
 *  - email       : Email of the user who requested the reset.
 *  - token       : Unique token string.
 *  - expiryDate  : When the token becomes invalid (example: after 30 minutes).
 *
 * Once the user resets the password successfully, this token is removed.
 * ----------------------------------------------------------------------------
 */

@Document(collection = "password_reset_tokens")
public class PasswordResetToken {

    /**
     * MongoDB primary key — generated automatically.
     */
    @Id
    private String id;

    /**
     * Email address of the user who requested the password reset.
     */
    private String email;

    /**
     * The actual reset token that gets emailed to the user.
     */
    private String token;

    /**
     * When the token expires.
     * After this time, it cannot be used.
     */
    private LocalDateTime expiryDate;

    /**
     * Default constructor required by Spring + MongoDB.
     */
    public PasswordResetToken() {}

    /**
     * Convenience constructor used when creating a new reset token.
     */
    public PasswordResetToken(String email, String token, LocalDateTime expiryDate) {
        this.email = email;
        this.token = token;
        this.expiryDate = expiryDate;
    }

    // ---------------------------
    // Getters
    // ---------------------------

    public String getId() { return id; }
    public String getEmail() { return email; }
    public String getToken() { return token; }
    public LocalDateTime getExpiryDate() { return expiryDate; }

    // ---------------------------
    // Setters
    // ---------------------------

    public void setId(String id) { this.id = id; }
    public void setEmail(String email) { this.email = email; }
    public void setToken(String token) { this.token = token; }
    public void setExpiryDate(LocalDateTime expiryDate) { this.expiryDate = expiryDate; }
}
