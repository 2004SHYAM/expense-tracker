package com.expensetracker.backend.repository;

import com.expensetracker.backend.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

/**
 * ----------------------------------------------------------------------------
 * UserRepository
 * ----------------------------------------------------------------------------
 * This interface handles all database operations related to the "users" 
 * collection in MongoDB.
 *
 * It extends:
 *
 *      MongoRepository<User, String>
 *
 * Which automatically provides the most common CRUD operations:
 *
 *  • save(user)            → create/update a user  
 *  • findById(id)          → fetch a user by MongoDB ID  
 *  • deleteById(id)        → remove a user  
 *  • findAll()             → list all users  
 *
 * We also define one custom finder below:
 *
 *      Optional<User> findByEmail(String email)
 *
 * Spring Data reads the method name and auto-generates a query:
 *
 *      { "email": <email_value> }
 *
 * This is used during login, registration checks, password reset, etc.
 *
 * Returning Optional<User> makes it safer and avoids null pointer issues.
 * ----------------------------------------------------------------------------
 */
public interface UserRepository extends MongoRepository<User, String> {

    /**
     * Finds a user by email.
     * Used in login, registration check, team joining, etc.
     *
     * @param email the user's email address
     * @return Optional<User> containing the user if found
     */
    Optional<User> findByEmail(String email);
}
