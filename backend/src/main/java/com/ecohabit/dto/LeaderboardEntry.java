package com.ecohabit.dto;

public class LeaderboardEntry {
    private Long id;
    private String username;
    private String firstName;
    private String lastName;
    private Long points;
    private Integer streak;
    private Integer achievements;

    public LeaderboardEntry() {
    }

    public LeaderboardEntry(Long id, String username, String firstName, String lastName,
            Long points, Integer streak, Integer achievements) {
        this.id = id;
        this.username = username;
        this.firstName = firstName;
        this.lastName = lastName;
        this.points = points;
        this.streak = streak;
        this.achievements = achievements;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public Long getPoints() {
        return points;
    }

    public void setPoints(Long points) {
        this.points = points;
    }

    public Integer getStreak() {
        return streak;
    }

    public void setStreak(Integer streak) {
        this.streak = streak;
    }

    public Integer getAchievements() {
        return achievements;
    }

    public void setAchievements(Integer achievements) {
        this.achievements = achievements;
    }
}