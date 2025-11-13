package com.expensetracker.backend.controller;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.expensetracker.backend.model.Expense;
import com.expensetracker.backend.model.ExpenseShare;
import com.expensetracker.backend.model.Team;
import com.expensetracker.backend.model.User;
import com.expensetracker.backend.repository.ExpenseRepository;
import com.expensetracker.backend.repository.TeamRepository;
import com.expensetracker.backend.repository.UserRepository;

@RestController
@RequestMapping("/api/expenses")
@CrossOrigin(origins = "*")
public class ExpenseController {

    @Autowired private ExpenseRepository expenseRepo;
    @Autowired private TeamRepository teamRepo;
    @Autowired private UserRepository userRepo;

    // ✅ Add new expense and auto-split evenly among all team members
    @PostMapping("/add")
    public ResponseEntity<?> addExpense(@RequestBody Expense expense) {
        if (expense.getTeamId() == null || expense.getPaidByUserId() == null) {
            return ResponseEntity.badRequest().body("TeamId and PaidByUserId are required");
        }

        Optional<Team> teamOpt = teamRepo.findById(expense.getTeamId());
        if (teamOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Team not found");
        }

        Team team = teamOpt.get();
        List<String> members = team.getMemberIds();
        if (members.isEmpty()) {
            return ResponseEntity.badRequest().body("No team members found");
        }

        double splitAmount = Math.round((expense.getAmount() / members.size()) * 100.0) / 100.0;
        List<ExpenseShare> shares = new ArrayList<>();

        for (String memberId : members) {
            boolean isPayer = memberId.equals(expense.getPaidByUserId());
            shares.add(new ExpenseShare(memberId, splitAmount, isPayer));
        }

        expense.setShares(shares);
        expense.setDate(Instant.now());
        expenseRepo.save(expense);

        return ResponseEntity.ok("Expense added and split evenly among members.");
    }

    // ✅ Get all expenses for a team
    @GetMapping("/team/{teamId}")
    public ResponseEntity<?> getTeamExpenses(@PathVariable String teamId) {
        return ResponseEntity.ok(expenseRepo.findByTeamId(teamId));
    }

    // ✅ Toggle payment status
    @PutMapping("/{expenseId}/togglePay")
    public ResponseEntity<?> togglePayment(@PathVariable String expenseId, @RequestParam String userId) {
        Expense expense = expenseRepo.findById(expenseId)
                .orElseThrow(() -> new RuntimeException("Expense not found"));

        for (ExpenseShare share : expense.getShares()) {
            if (share.getUserId().equals(userId)) {
                share.setPaid(!share.isPaid());
                break;
            }
        }

        expenseRepo.save(expense);
        return ResponseEntity.ok("Payment status toggled successfully!");
    }

    // ✅ Summary (auto-zero and reset when everyone is balanced)
    @GetMapping("/summary/{teamId}")
    public ResponseEntity<?> getMonthlySummary(@PathVariable String teamId) {
        List<Expense> expenses = expenseRepo.findByTeamId(teamId);

        // Sort expenses by date for correct sequence (old → new)
        expenses.sort(Comparator.comparing(Expense::getDate));

        Map<String, Double> balance = new HashMap<>();

        for (Expense e : expenses) {
            double totalAmount = e.getAmount();
            double splitAmount = e.getAmount() / e.getShares().size();
            String payerId = e.getPaidByUserId();

            // Subtract share from each member
            for (ExpenseShare share : e.getShares()) {
                String memberId = share.getUserId();
                balance.put(memberId, balance.getOrDefault(memberId, 0.0) - splitAmount);
            }

            // Add total amount to payer
            balance.put(payerId, balance.getOrDefault(payerId, 0.0) + totalAmount);

            // ✅ After each expense, check if everyone is now balanced (≈0)
            double total = balance.values().stream().mapToDouble(Double::doubleValue).sum();
            double maxAbs = balance.values().stream().mapToDouble(Math::abs).max().orElse(0.0);

            if (Math.abs(total) < 0.01 && maxAbs < 0.01) {
                // Everyone is balanced → reset all to zero
                balance.replaceAll((k, v) -> 0.0);
            }
        }

        // Convert userId → readable email
        Map<String, Double> readableSummary = new LinkedHashMap<>();
        for (Map.Entry<String, Double> entry : balance.entrySet()) {
            String id = entry.getKey();
            Optional<User> userOpt = userRepo.findById(id);
            String email = userOpt.map(User::getEmail).orElse(id);
            readableSummary.put(email, Math.round(entry.getValue() * 100.0) / 100.0);
        }

        // ✅ Sort for readability
        Map<String, Double> sortedSummary = readableSummary.entrySet().stream()
                .sorted((a, b) -> Double.compare(b.getValue(), a.getValue()))
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        Map.Entry::getValue,
                        (e1, e2) -> e1,
                        LinkedHashMap::new
                ));

        return ResponseEntity.ok(sortedSummary);
    }

    // ✅ Delete expense
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteExpense(@PathVariable String id) {
        expenseRepo.deleteById(id);
        return ResponseEntity.ok("Expense deleted successfully!");
    }
}
