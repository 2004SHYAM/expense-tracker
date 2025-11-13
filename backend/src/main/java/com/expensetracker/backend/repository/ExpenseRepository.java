package com.expensetracker.backend.repository;

import com.expensetracker.backend.model.Expense;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface ExpenseRepository extends MongoRepository<Expense, String> {
    List<Expense> findByTeamId(String teamId);
}
