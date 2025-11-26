package com.expensetracker.backend.service;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;

/**
 * ----------------------------------------------------------------------------
 * JwtService
 * ----------------------------------------------------------------------------
 * This service is responsible for creating and validating JWT tokens.
 *
 * A JWT token allows the frontend to prove the user is authenticated without
 * sending a password every time.
 *
 * This class:
 *   ✔ Generates a signed token when a user logs in
 *   ✔ Extracts user information (email) from an incoming token
 *   ✔ Validates signature using a secret key
 *
 * JJWT (io.jsonwebtoken) handles the cryptography and token building.
 * ----------------------------------------------------------------------------
 */
@Service
public class JwtService {

    /**
     * SECRET_KEY:
     * The key used to both sign and verify JWT tokens.
     *
     * Important:
     * - In real production apps, this MUST NOT be hardcoded.
     * - It should come from environment variables or secret managers.
     */
    private static final String SECRET_KEY = "THIS_IS_A_VERY_SECRET_KEY_1234567890";

    /**
     * Converts the string-based SECRET_KEY into an HMAC-SHA256 signing key
     * that JJWT library can use.
     *
     * HMAC requires the key as bytes → we convert using UTF-8 encoding.
     */
    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(SECRET_KEY.getBytes(StandardCharsets.UTF_8));
    }

    /**
     * Generates a new JWT token for a user.
     *
     * @param email - the user's email address (saved as subject inside the token).
     * @return the signed JWT in compact string form.
     *
     * Token details:
     * - subject → email (acts as user identity)
     * - issuedAt → token creation time
     * - expiration → 1 hour from now
     * - signWith → signs token with SECRET_KEY using HS256 algorithm
     */
    public String generateToken(String email) {
        return Jwts.builder()
                .setSubject(email) // who the token belongs to
                .setIssuedAt(new Date()) // token creation time
                .setExpiration(new Date(System.currentTimeMillis() + (1000 * 60 * 60))) // valid 1 hour
                .signWith(getSigningKey(), SignatureAlgorithm.HS256) // sign using SECRET_KEY
                .compact(); // convert to final JWT string
    }

    /**
     * Extracts the email (subject) from a token.
     *
     * This method also automatically validates:
     * - token signature
     * - token format
     * - expiration
     *
     * If the token is invalid or expired, parsing will throw an exception.
     *
     * @param token the JWT sent from frontend
     * @return email stored inside the token
     */
    public String extractEmail(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey()) // verify with same secret key
                .build()
                .parseClaimsJws(token) // parse and validate token
                .getBody()
                .getSubject(); // extract email (subject)
    }
}
