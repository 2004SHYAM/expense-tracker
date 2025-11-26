// src/main/java/com/expensetracker/backend/model/User.java
package com.expensetracker.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;

@Document(collection = "users")
public class User {

    @Id
    private String id;

    private String firstName;
    private String lastName;
    private String email;
    private String password;

    // NEW: supports multi-team
    private List<String> teamIds = new ArrayList<>();

    // NEW: profile picture stored as base64 or image URL
    private String profileImage;

    // NEW: optional phone number
    private String phone;

    public User() {}

    public User(String firstName, String lastName, String email, String password) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.password = password;
    }

    // return combined full name
    public String getFullName() {
        return (firstName + " " + lastName).trim();
    }

    // Getter / Setters
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
    public void addTeamId(String teamId) {
        if (!this.teamIds.contains(teamId)) {
            this.teamIds.add(teamId);
        }
    }

    // profile image - base64 or url
    public String getProfileImage() { return profileImage; }
    public void setProfileImage(String profileImage) { this.profileImage = profileImage; }

    // phone
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

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
