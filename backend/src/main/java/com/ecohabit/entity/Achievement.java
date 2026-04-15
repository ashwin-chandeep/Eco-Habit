package com.ecohabit.entity;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "achievements")
@JsonIgnoreProperties({"hibernateLazyInitializer","handler"})
public class Achievement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 100)
    private String name;

    @Size(max = 500)
    private String description;

    @NotBlank
    @Size(max = 50)
    private String type; // STREAK, TOTAL_HABITS, POINTS, etc.

    @Column(name = "required_value")
    private Integer requiredValue; // e.g., 7 for 7-day streak

    @Column(name = "badge_icon")
    private String badgeIcon;

    @Column(name = "badge_color")
    private String badgeColor;

    @Column(name = "points_reward")
    private Integer pointsReward = 0;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "achievement", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore // avoid recursive serialization and heavy payloads
    private Set<UserAchievement> userAchievements = new HashSet<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    // Constructors
    public Achievement() {
    }

    public Achievement(String name, String description, String type, Integer requiredValue,
            String badgeIcon, String badgeColor, Integer pointsReward) {
        this.name = name;
        this.description = description;
        this.type = type;
        this.requiredValue = requiredValue;
        this.badgeIcon = badgeIcon;
        this.badgeColor = badgeColor;
        this.pointsReward = pointsReward;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Integer getRequiredValue() {
        return requiredValue;
    }

    public void setRequiredValue(Integer requiredValue) {
        this.requiredValue = requiredValue;
    }

    public String getBadgeIcon() {
        return badgeIcon;
    }

    public void setBadgeIcon(String badgeIcon) {
        this.badgeIcon = badgeIcon;
    }

    public String getBadgeColor() {
        return badgeColor;
    }

    public void setBadgeColor(String badgeColor) {
        this.badgeColor = badgeColor;
    }

    public Integer getPointsReward() {
        return pointsReward;
    }

    public void setPointsReward(Integer pointsReward) {
        this.pointsReward = pointsReward;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public Set<UserAchievement> getUserAchievements() {
        return userAchievements;
    }

    public void setUserAchievements(Set<UserAchievement> userAchievements) {
        this.userAchievements = userAchievements;
    }
}