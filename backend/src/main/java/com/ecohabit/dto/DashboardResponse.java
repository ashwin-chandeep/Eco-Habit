package com.ecohabit.dto;

import java.util.List;
import java.util.Map;

public class DashboardResponse {
    
    private Long totalPoints;
    private Integer currentStreak;
    private Integer longestStreak;
    private Integer totalHabitsCompleted;
    private Integer achievementsCount;
    private List<HabitStreakInfo> habitStreaks;
    private List<RecentActivityInfo> recentActivity;
    private Map<String, Integer> weeklyProgress;
    
    // Constructors
    public DashboardResponse() {}
    
    // Getters and Setters
    public Long getTotalPoints() { return totalPoints; }
    public void setTotalPoints(Long totalPoints) { this.totalPoints = totalPoints; }
    
    public Integer getCurrentStreak() { return currentStreak; }
    public void setCurrentStreak(Integer currentStreak) { this.currentStreak = currentStreak; }
    
    public Integer getLongestStreak() { return longestStreak; }
    public void setLongestStreak(Integer longestStreak) { this.longestStreak = longestStreak; }
    
    public Integer getTotalHabitsCompleted() { return totalHabitsCompleted; }
    public void setTotalHabitsCompleted(Integer totalHabitsCompleted) { this.totalHabitsCompleted = totalHabitsCompleted; }
    
    public Integer getAchievementsCount() { return achievementsCount; }
    public void setAchievementsCount(Integer achievementsCount) { this.achievementsCount = achievementsCount; }
    
    public List<HabitStreakInfo> getHabitStreaks() { return habitStreaks; }
    public void setHabitStreaks(List<HabitStreakInfo> habitStreaks) { this.habitStreaks = habitStreaks; }
    
    public List<RecentActivityInfo> getRecentActivity() { return recentActivity; }
    public void setRecentActivity(List<RecentActivityInfo> recentActivity) { this.recentActivity = recentActivity; }
    
    public Map<String, Integer> getWeeklyProgress() { return weeklyProgress; }
    public void setWeeklyProgress(Map<String, Integer> weeklyProgress) { this.weeklyProgress = weeklyProgress; }
    
    // Inner classes for nested data
    public static class HabitStreakInfo {
        private Long habitId;
        private String habitName;
        private Integer currentStreak;
        private Integer longestStreak;
        private String category;
        private String iconName;
        
        // Constructors
        public HabitStreakInfo() {}
        
        public HabitStreakInfo(Long habitId, String habitName, Integer currentStreak, Integer longestStreak, String category, String iconName) {
            this.habitId = habitId;
            this.habitName = habitName;
            this.currentStreak = currentStreak;
            this.longestStreak = longestStreak;
            this.category = category;
            this.iconName = iconName;
        }
        
        // Getters and Setters
        public Long getHabitId() { return habitId; }
        public void setHabitId(Long habitId) { this.habitId = habitId; }
        
        public String getHabitName() { return habitName; }
        public void setHabitName(String habitName) { this.habitName = habitName; }
        
        public Integer getCurrentStreak() { return currentStreak; }
        public void setCurrentStreak(Integer currentStreak) { this.currentStreak = currentStreak; }
        
        public Integer getLongestStreak() { return longestStreak; }
        public void setLongestStreak(Integer longestStreak) { this.longestStreak = longestStreak; }
        
        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
        
        public String getIconName() { return iconName; }
        public void setIconName(String iconName) { this.iconName = iconName; }
    }
    
    public static class RecentActivityInfo {
        private String habitName;
        private String date;
        private boolean completed;
        private Integer pointsEarned;
        
        // Constructors
        public RecentActivityInfo() {}
        
        public RecentActivityInfo(String habitName, String date, boolean completed, Integer pointsEarned) {
            this.habitName = habitName;
            this.date = date;
            this.completed = completed;
            this.pointsEarned = pointsEarned;
        }
        
        // Getters and Setters
        public String getHabitName() { return habitName; }
        public void setHabitName(String habitName) { this.habitName = habitName; }
        
        public String getDate() { return date; }
        public void setDate(String date) { this.date = date; }
        
        public boolean isCompleted() { return completed; }
        public void setCompleted(boolean completed) { this.completed = completed; }
        
        public Integer getPointsEarned() { return pointsEarned; }
        public void setPointsEarned(Integer pointsEarned) { this.pointsEarned = pointsEarned; }
    }
}