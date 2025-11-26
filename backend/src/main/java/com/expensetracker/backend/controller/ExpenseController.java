package com.expensetracker.backend.controller;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.expensetracker.backend.model.Expense;
import com.expensetracker.backend.model.ExpenseShare;
import com.expensetracker.backend.model.Team;
import com.expensetracker.backend.model.User;
import com.expensetracker.backend.repository.ExpenseRepository;
import com.expensetracker.backend.repository.TeamRepository;
import com.expensetracker.backend.repository.UserRepository;

/**
 * ExpenseController
 *
 * Responsibilities:
 *  - Create expenses (even split)
 *  - List team expenses
 *  - Toggle a payment request (cash path quick toggle)
 *  - Submit payment (cash / UPI)
 *  - Approve / Reject payment (payee action)
 *  - Return pending approvals for a payee
 *  - Return team summary (needToPay / needToGet)
 *  - Delete expense
 *  - Return user-specific expenses within a team
 *
 * This file is intentionally commented heavily to explain each line and decision.
 */
@RestController
@RequestMapping("/api/expenses")
@CrossOrigin(origins = "*")
public class ExpenseController {

    // Repositories injected by Spring for DB access
    @Autowired private ExpenseRepository expenseRepo;
    @Autowired private TeamRepository teamRepo;
    @Autowired private UserRepository userRepo;

    // -----------------------
    // Add expense (auto-split)
    // -----------------------
    // POST /api/expenses/add
    @PostMapping("/add")
    public ResponseEntity<?> addExpense(@RequestBody Expense expense) {
        // Validate mandatory fields
        if (expense.getTeamId() == null || expense.getPaidByUserId() == null) {
            return ResponseEntity.badRequest().body("TeamId and PaidByUserId are required");
        }

        // Ensure team exists
        Optional<Team> teamOpt = teamRepo.findById(expense.getTeamId());
        if (teamOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Team not found");
        }

        Team team = teamOpt.get();
        List<String> members = team.getMemberIds();

        // No members → invalid
        if (members == null || members.isEmpty()) {
            return ResponseEntity.badRequest().body("No team members found");
        }

        // Compute even split (rounded to 2 decimals)
        double splitAmount = Math.round((expense.getAmount() / members.size()) * 100.0) / 100.0;

        // Build shares list: payer is marked APPROVED, others UNPAID
        List<ExpenseShare> shares = new ArrayList<>(members.size());
        for (String memberId : members) {
            boolean isPayer = memberId.equals(expense.getPaidByUserId());
            shares.add(new ExpenseShare(memberId, splitAmount, isPayer));
        }

        // Attach computed shares and timestamp, then save
        expense.setShares(shares);
        expense.setDate(Instant.now());
        expenseRepo.save(expense);

        return ResponseEntity.ok("Expense added and split evenly among members.");
    }

    // -----------------------
    // Get all expenses for team
    // -----------------------
    // GET /api/expenses/team/{teamId}
    @GetMapping("/team/{teamId}")
    public ResponseEntity<?> getTeamExpenses(@PathVariable String teamId) {
        // Direct repository query, no processing — fast and simple
        return ResponseEntity.ok(expenseRepo.findByTeamId(teamId));
    }

    // -----------------------
    // Toggle payment (quick cash toggle)
    // -----------------------
    // PUT /api/expenses/{expenseId}/togglePay?userId=...
    @PutMapping("/{expenseId}/togglePay")
    public ResponseEntity<?> togglePayment(
            @PathVariable String expenseId,
            @RequestParam String userId) {

        // Load expense, throw if missing
        Expense expense = expenseRepo.findById(expenseId)
                .orElseThrow(() -> new RuntimeException("Expense not found"));

        // Find the share for the given user and update status based on current status
        for (ExpenseShare share : expense.getShares()) {
            if (share.getUserId().equals(userId)) {

                // Null-safe status
                String status = share.getStatus();
                if (status == null) status = "UNPAID";

                // Toggle/cycle behavior:
                // UNPAID or REJECTED => create a CASH request (pending)
                // PENDING_* => cancel back to UNPAID
                // APPROVED => cannot toggle
                switch (status) {
                    case "UNPAID":
                    case "REJECTED":
                        share.setPaymentMethod("CASH");
                        share.setStatus("PENDING_CASH_APPROVAL");
                        break;

                    case "PENDING_CASH_APPROVAL":
                    case "PENDING_UPI_APPROVAL":
                        // cancel the request and clear proof/method
                        share.setStatus("UNPAID");
                        share.setPaymentMethod(null);
                        share.setProofImage(null);
                        break;

                    case "APPROVED":
                        return ResponseEntity.badRequest().body("Payment already approved");
                }

                break; // found user share → stop loop
            }
        }

        // persist change
        expenseRepo.save(expense);
        return ResponseEntity.ok("Payment status updated.");
    }

    // -----------------------
    // Submit payment (UPI or Cash)
    // -----------------------
    // Body: { expenseId, userId, paymentMethod, proofImage (optional for UPI) }
    // POST /api/expenses/pay
    @PostMapping("/pay")
    public ResponseEntity<?> payExpense(@RequestBody Map<String, Object> body) {

        // Extract parameters from JSON body safely
        String expenseId = (String) body.get("expenseId");
        String userId = (String) body.get("userId");
        String method = (String) body.get("paymentMethod");
        String proofImage = (String) body.get("proofImage");

        Optional<Expense> opt = expenseRepo.findById(expenseId);
        if (opt.isEmpty()) return ResponseEntity.badRequest().body("Expense not found");

        Expense expense = opt.get();

        // Find the matching share and set the payment method + status
        for (ExpenseShare share : expense.getShares()) {
            if (share.getUserId().equals(userId)) {
                share.setPaymentMethod(method);

                // Cash flow: set pending cash approval
                if ("CASH".equalsIgnoreCase(method)) {
                    share.setStatus("PENDING_CASH_APPROVAL");
                }
                // UPI flow: save proof and mark pending UPI approval
                else if ("UPI".equalsIgnoreCase(method)) {
                    share.setProofImage(proofImage);
                    share.setStatus("PENDING_UPI_APPROVAL");
                }
                break;
            }
        }

        // Persist and return
        expenseRepo.save(expense);
        return ResponseEntity.ok("Payment submitted successfully and is waiting for approval.");
    }

    // -----------------------
    // Approve or Reject payment (payee action)
    // -----------------------
    // POST /api/expenses/approve-payment/{expenseId}/{memberId}?action=APPROVE|REJECT
    @PostMapping("/approve-payment/{expenseId}/{memberId}")
    public ResponseEntity<?> approveOrReject(
            @PathVariable String expenseId,
            @PathVariable String memberId,
            @RequestParam String action) {

        // Useful debug print to verify endpoint hit (remove in prod)
        System.out.println("Hit APPROVE API: expense=" + expenseId + " member=" + memberId + " action=" + action);

        Optional<Expense> opt = expenseRepo.findById(expenseId);
        if (opt.isEmpty()) return ResponseEntity.badRequest().body("Expense not found");

        Expense expense = opt.get();

        // Update the matching share
        for (ExpenseShare share : expense.getShares()) {
            if (share.getUserId().equals(memberId)) {

                if ("APPROVE".equalsIgnoreCase(action)) {
                    // Mark that the payee accepted the payment
                    share.setStatus("APPROVED");
                } else if ("REJECT".equalsIgnoreCase(action)) {
                    // Mark rejected and clear method/proof so user can resubmit
                    share.setStatus("REJECTED");
                    share.setPaymentMethod(null);
                    share.setProofImage(null);
                } else {
                    return ResponseEntity.badRequest().body("Invalid action");
                }

                // Save immediately after change and return success
                expenseRepo.save(expense);
                return ResponseEntity.ok("Payment " + action.toLowerCase() + " successfully");
            }
        }

        // No share for that member
        return ResponseEntity.badRequest().body("Share not found");
    }

    // -----------------------
    // Get pending approvals for a payee
    // -----------------------
    // GET /api/expenses/pending-approvals/{teamId}/{payeeId}
    @GetMapping("/pending-approvals/{teamId}/{payeeId}")
    public ResponseEntity<?> getPendingApprovals(
            @PathVariable String teamId,
            @PathVariable String payeeId) {

        // Fetch all expenses for the team
        List<Expense> expenses = expenseRepo.findByTeamId(teamId);

        // Build a compact result list that includes only pending shares and some metadata
        List<Map<String, Object>> result = new ArrayList<>();

        for (Expense ex : expenses) {

            // Only the payer (payeeId) should see approvals they need to act upon
            if (!Objects.equals(ex.getPaidByUserId(), payeeId)) continue;

            // Collect pending shares for this expense
            List<ExpenseShare> pendingShares = ex.getShares().stream()
                    .filter(s -> "PENDING_CASH_APPROVAL".equals(s.getStatus()) ||
                                 "PENDING_UPI_APPROVAL".equals(s.getStatus()))
                    .collect(Collectors.toList());

            // If there are pending shares, return minimal expense info + pending shares
            if (!pendingShares.isEmpty()) {
                Map<String, Object> map = new HashMap<>();
                map.put("id", ex.getId());
                map.put("description", ex.getDescription());
                map.put("amount", ex.getAmount());
                map.put("shares", pendingShares);
                result.add(map);
            }
        }

        return ResponseEntity.ok(result);
    }

    // -----------------------
    // Team summary (needToPay / needToGet)
    // -----------------------
    // GET /api/expenses/summary/{teamId}
    @GetMapping("/summary/{teamId}")
    public ResponseEntity<?> getMonthlySummary(@PathVariable String teamId) {

        // Retrieve and sort expenses by date so balances accumulate in sequence
        List<Expense> expenses = expenseRepo.findByTeamId(teamId);
        expenses.sort(Comparator.comparing(Expense::getDate));

        // Running balance per user id
        Map<String, Double> balance = new HashMap<>();

        for (Expense e : expenses) {
            double splitAmount = e.getAmount() / Math.max(e.getShares().size(), 1);
            String payerId = e.getPaidByUserId();

            // Each member owes splitAmount (subtract)
            for (ExpenseShare share : e.getShares()) {
                String memberId = share.getUserId();
                balance.put(memberId, balance.getOrDefault(memberId, 0.0) - splitAmount);
            }

            // Payer receives total amount (add)
            balance.put(payerId, balance.getOrDefault(payerId, 0.0) + e.getAmount());

            // If rounding has balanced everyone to ~0, reset to clean zeros
            double total = balance.values().stream().mapToDouble(Double::doubleValue).sum();
            double maxAbs = balance.values().stream().mapToDouble(Math::abs).max().orElse(0.0);

            if (Math.abs(total) < 0.01 && maxAbs < 0.01) {
                balance.replaceAll((k, v) -> 0.0);
            }
        }

        // Convert userId -> email (readable) and round values
        Map<String, Double> readable = new LinkedHashMap<>();
        for (var entry : balance.entrySet()) {
            String id = entry.getKey();
            Optional<User> userOpt = userRepo.findById(id);
            String email = userOpt.map(User::getEmail).orElse(id);
            readable.put(email, Math.round(entry.getValue() * 100.0) / 100.0);
        }

        // Sort descending by amount (largest creditors first)
        Map<String, Double> sorted = readable.entrySet().stream()
                .sorted((a, b) -> Double.compare(b.getValue(), a.getValue()))
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        Map.Entry::getValue,
                        (e1, e2) -> e1,
                        LinkedHashMap::new
                ));

        return ResponseEntity.ok(sorted);
    }

    // -----------------------
    // Delete an expense
    // -----------------------
    // DELETE /api/expenses/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteExpense(@PathVariable String id) {
        expenseRepo.deleteById(id);
        return ResponseEntity.ok("Expense deleted successfully!");
    }

    // -----------------------
    // Get expenses of a specific user in a team (user as payer)
    // -----------------------
    // GET /api/expenses/team/{teamId}/user/{userId}
    @GetMapping("/team/{teamId}/user/{userId}")
    public ResponseEntity<?> getUserExpenses(
            @PathVariable String teamId,
            @PathVariable String userId) {

        // Only return expenses where the provided user is the payer
        List<Expense> expenses = expenseRepo.findByTeamId(teamId)
                .stream()
                .filter(e -> Objects.equals(e.getPaidByUserId(), userId))
                .collect(Collectors.toList());

        return ResponseEntity.ok(expenses);
    }
}
