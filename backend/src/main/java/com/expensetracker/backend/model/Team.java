package com.expensetracker.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "teams")
public class Team {
    @Id
    private String id;
    private String teamName;
    private String joinCode;
    private String ownerId;
    private Instant createdAt;
    private List<String> memberIds = new ArrayList<>();
    private String TeamId;

    public Team() {}

    // Getters
    public String getId() { return id; }
    public String getTeamName() { return teamName; }
    public String getJoinCode() { return joinCode; }
    public String getOwnerId() { return ownerId; }
    public Instant getCreatedAt() { return createdAt; }
    public List<String> getMemberIds() { return memberIds; }
    public String getTeamId() { return TeamId; }

    // Setters
    public void setId(String id) { this.id = id; }
    public void setTeamName(String teamName) { this.teamName = teamName; }
    public void setJoinCode(String joinCode) { this.joinCode = joinCode; }
    public void setOwnerId(String ownerId) { this.ownerId = ownerId; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public void setMemberIds(List<String> memberIds) { this.memberIds = memberIds; }
    public void setTeamId(String teamId) { TeamId = teamId; }
}
