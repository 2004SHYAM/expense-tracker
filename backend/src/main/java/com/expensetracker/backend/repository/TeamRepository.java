package com.expensetracker.backend.repository;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.expensetracker.backend.model.Team;

/**
 * ----------------------------------------------------------------------------
 * TeamRepository
 * ----------------------------------------------------------------------------
 * This repository manages all database operations for the "teams" collection.
 *
 * By extending MongoRepository<Team, String>, Spring Data automatically
 * provides the most common CRUD functions:
 *
 *  - save(team)           → create or update a team
 *  - findById(id)         → get a team by its MongoDB ID
 *  - deleteById(id)       → remove a team
 *  - findAll()            → list all teams
 *
 * Below, we define one custom finder:
 *
 *      Optional<Team> findByJoinCode(String joinCode)
 *
 * Spring reads this method name and automatically creates a MongoDB query:
 *
 *      { "joinCode": <joinCode_value> }
 *
 * This is used when a new user types a join code to enter a team.
 *
 * Returning Optional<Team> makes it clean and safe — avoids null issues.
 * ----------------------------------------------------------------------------
 */
public interface TeamRepository extends MongoRepository<Team, String> {

    /**
     * Looks up a team using its unique join code.
     * Used when someone joins a team via code or QR.
     *
     * @param joinCode the code assigned to the team
     * @return Optional<Team> containing the team if found
     */
    Optional<Team> findByJoinCode(String joinCode);
}
