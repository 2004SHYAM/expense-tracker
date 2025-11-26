package com.expensetracker.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.ArrayList;
import java.util.List;

/**
 * ----------------------------------------------------------------------------
 * User
 * ----------------------------------------------------------------------------
 * This model represents a registered user inside the Expense Tracker system.
 *
 * A user can:
 *   - Belong to multiple teams
 *   - Add and view expenses
 *   - Approve/reject payments
 *   - Log in using email & password
 *
 * This class maps to the MongoDB "users" collection.
 * ----------------------------------------------------------------------------
 */
@Document(collection = "users")
public class User {

    /**
     * MongoDB unique ID for this user.
     */
    @Id
    private String id;

    /**
     * User's first and last name.
     * These values can be optional (especially in login via email only).
     */
    private String firstName;
    private String lastName;

    /**
     * Email is used as the login username and must be unique.
     */
    private String email;

    /**
     * BCrypt-hashed password stored securely.
     */
    private String password;

    /**
     * NEW FEATURE:
     * A user can now join multiple teams.
     * This list stores the IDs of all the teams the user belongs to.
     */
    private List<String> teamIds = new ArrayList<>();

    // ----------------------------------------------------------------------
    // CONSTRUCTORS
    // ----------------------------------------------------------------------

    public User() {}

    /**
     * Convenience constructor used during registration.
     */
    public User(String firstName, String lastName, String email, String password) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.password = password;
    }

    // ----------------------------------------------------------------------
    // LOGIC HELPERS
    // ----------------------------------------------------------------------

    /**
     * Returns the user's full name in a clean format.
     * If last name is missing, it avoids leaving trailing spaces.
     */
    public String getFullName() {
        return (firstName + " " + lastName).trim();
    }

    // ----------------------------------------------------------------------
    // GETTERS & SETTERS
    // ----------------------------------------------------------------------

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public List<String> getTeamIds() { return teamIds; }
    public void setTeamIds(List<String> teamIds) { this.teamIds = teamIds; }

    /**
     * Adds a new team ID if the user isn’t already a member.
     */
    public void addTeamId(String teamId) {
        if (!this.teamIds.contains(teamId)) {
            this.teamIds.add(teamId);
        }
    }

    // ----------------------------------------------------------------------
    // DEBUG HELPER
    // ----------------------------------------------------------------------

    @Override
    public String toString() {
        return "User{" +
                "id='" + id + '\'' +
                ", firstName='" + firstName + '\'' +
                ", lastName='" + lastName + '\'' +
                ", email='" + email + '\'' +
                ", teamIds=" + teamIds +
                '}';
    }
}
