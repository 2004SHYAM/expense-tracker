package com.expensetracker.backend.service;

import com.expensetracker.backend.model.Expense;
import com.expensetracker.backend.model.ExpenseShare;
import com.expensetracker.backend.model.Team;
import com.expensetracker.backend.model.User;
import com.expensetracker.backend.repository.ExpenseRepository;
import com.expensetracker.backend.repository.TeamRepository;
import com.expensetracker.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class TeamService {

    @Autowired
    private TeamRepository teamRepo;

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private ExpenseRepository expenseRepo;

    public List<Team> getTeamExpensesForUser(String userId) {

        List<Team> list = new ArrayList<>();

        Optional<User> userOpt = userRepo.findById(userId);
        if (userOpt.isEmpty()) return list;

        User user = userOpt.get();

        for (String teamId : user.getTeamIds()) {

            Optional<Team> teamOpt = teamRepo.findById(teamId);
            if (teamOpt.isEmpty()) continue;

            Team team = teamOpt.get();

            List<Expense> expenses = expenseRepo.findByTeamId(teamId);

            double needToPay = 0;
            double needToGet = 0;

            for (Expense exp : expenses) {

                String paidBy = exp.getPaidByUserId();

                for (ExpenseShare s : exp.getShares()) {

                    if (!s.isPaid() && !s.getUserId().equals(paidBy) && s.getUserId().equals(userId)) {
                        // user owes
                        needToPay += s.getAmount();
                    }

                    if (!s.isPaid() && paidBy.equals(userId) && !s.getUserId().equals(userId)) {
                        // user should get
                        needToGet += s.getAmount();
                    }
                }
            }

            team.setUserName(user.getFullName());
            team.setNeedToPay(Math.round(needToPay * 100.0) / 100.0);
            team.setNeedToGet(Math.round(needToGet * 100.0) / 100.0);

            list.add(team);
        }

        return list;
    }
}
