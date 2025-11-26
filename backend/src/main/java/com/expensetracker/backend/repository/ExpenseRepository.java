package com.expensetracker.backend.repository;

import com.expensetracker.backend.model.Expense;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

/**
 * ----------------------------------------------------------------------------
 * ExpenseRepository
 * ----------------------------------------------------------------------------
 * This interface handles all database operations for the "expenses" collection.
 *
 * Spring Data MongoDB automatically generates the implementation at runtime.
 * You don’t need to write any SQL or queries manually.
 *
 * It extends MongoRepository, which already provides:
 *   - save()        → insert or update
 *   - findById()    → get a single expense
 *   - findAll()     → get all expenses
 *   - deleteById()  → delete a record
 *
 * Below, we also add a custom finder method:
 *   List<Expense> findByTeamId(String teamId)
 *
 * Spring automatically interprets the method name and builds the query:
 *   { "teamId": <teamId> }
 *
 * This lets you fetch all expenses for a specific team.
 * ----------------------------------------------------------------------------
 */
public interface ExpenseRepository extends MongoRepository<Expense, String> {

    /**
     * Returns all expenses belonging to a specific team.
     * 
     * @param teamId - the ID of the team
     * @return List of Expense documents where teamId matches
     */
    List<Expense> findByTeamId(String teamId);
}
