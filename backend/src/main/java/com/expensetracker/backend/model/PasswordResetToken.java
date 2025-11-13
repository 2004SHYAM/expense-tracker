package com.expensetracker.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "password_reset_tokens")
public class PasswordResetToken {

    @Id
    private String id;
    private String email;
    private String token;
    private LocalDateTime expiryDate;

    public PasswordResetToken() {}

    public PasswordResetToken(String email, String token, LocalDateTime expiryDate) {
        this.email = email;
        this.token = token;
        this.expiryDate = expiryDate;
    }

    public String getId() { return id; }
    public String getEmail() { return email; }
    public String getToken() { return token; }
    public LocalDateTime getExpiryDate() { return expiryDate; }

    public void setId(String id) { this.id = id; }
    public void setEmail(String email) { this.email = email; }
    public void setToken(String token) { this.token = token; }
    public void setExpiryDate(LocalDateTime expiryDate) { this.expiryDate = expiryDate; }
}
