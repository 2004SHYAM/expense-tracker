package com.expensetracker.backend.repository;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.expensetracker.backend.model.Team;

public interface TeamRepository extends MongoRepository<Team, String> {
    Optional<Team> findByJoinCode(String joinCode);
}
