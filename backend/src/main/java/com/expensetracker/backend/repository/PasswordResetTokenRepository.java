package com.expensetracker.backend.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.expensetracker.backend.model.PasswordResetToken;
import java.util.Optional;

/**
 * ----------------------------------------------------------------------------
 * PasswordResetTokenRepository
 * ----------------------------------------------------------------------------
 * This repository handles all database interactions for the
 * "password_reset_tokens" collection in MongoDB.
 *
 * It extends MongoRepository, which already provides CRUD operations like:
 *   - save()            → insert or update a reset token
 *   - findById()        → get a token by its MongoDB ID
 *   - deleteById()      → remove a document
 *   - findAll()         → list all tokens (usually for debugging)
 *
 * Below we define a custom query method:
 *
 *      Optional<PasswordResetToken> findByToken(String token)
 *
 * Spring Data automatically converts this method into:
 *      { "token": <token_value> }
 *
 * This is used when verifying a password-reset link clicked by the user.
 *
 * Returning Optional helps avoid null checks and prevents crashes when
 * the token does not exist.
 * ----------------------------------------------------------------------------
 */
public interface PasswordResetTokenRepository extends MongoRepository<PasswordResetToken, String> {

    /**
     * Finds a reset token document by its token string.
     *
     * @param token - the actual reset token sent to the user's email
     * @return optional containing the token details if found
     */
    Optional<PasswordResetToken> findByToken(String token);
}
