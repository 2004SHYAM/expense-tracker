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
    private String ownerId;
    private String joinCode;
    private Instant createdAt;

    private List<String> memberIds = new ArrayList<>();

    // For summary
    private String userName;
    private double needToPay;
    private double needToGet;

    public String getId() { return id; }

    public String getTeamName() { return teamName; }

    public void setTeamName(String teamName) { this.teamName = teamName; }

    public String getOwnerId() { return ownerId; }

    public void setOwnerId(String ownerId) { this.ownerId = ownerId; }

    public String getJoinCode() { return joinCode; }

    public void setJoinCode(String joinCode) { this.joinCode = joinCode; }

    public Instant getCreatedAt() { return createdAt; }

    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public List<String> getMemberIds() { return memberIds; }

    // Summary
    public String getUserName() { return userName; }

    public void setUserName(String userName) { this.userName = userName; }

    public double getNeedToPay() { return needToPay; }

    public void setNeedToPay(double needToPay) { this.needToPay = needToPay; }

    public double getNeedToGet() { return needToGet; }

    public void setNeedToGet(double needToGet) { this.needToGet = needToGet; }
}
