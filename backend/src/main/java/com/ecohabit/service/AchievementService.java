package com.ecohabit.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ecohabit.entity.Achievement;
import com.ecohabit.entity.User;
import com.ecohabit.entity.UserAchievement;
import com.ecohabit.repository.AchievementRepository;
import com.ecohabit.repository.HabitLogRepository;
import com.ecohabit.repository.UserAchievementRepository;

@Service
public class AchievementService {

    @Autowired
    private AchievementRepository achievementRepository;

    @Autowired
    private UserAchievementRepository userAchievementRepository;

    @Autowired
    private HabitLogRepository habitLogRepository;

    public List<Achievement> getAllAchievements() {
        return achievementRepository.findAll();
    }

    public List<UserAchievement> getUserAchievements(User user) {
        return userAchievementRepository.findByUserWithAchievements(user);
    }

    // Compute which achievement IDs the user should currently have (without
    // mutating DB)
    public java.util.Set<Long> getExpectedAchievementIds(User user) {
        int overallLongestStreak = calculateOverallLongestStreakLastYear(user);
        long totalCompletedHabits = getTotalHabitsCompletedLastYear(user);
        long totalPoints = java.util.Optional.ofNullable(habitLogRepository.getTotalPointsByUser(user)).orElse(0L);

        java.util.Set<Long> shouldHave = new java.util.HashSet<>();
        for (Achievement a : achievementRepository.findAll()) {
            switch (a.getType()) {
                case "STREAK":
                    if (overallLongestStreak >= a.getRequiredValue())
                        shouldHave.add(a.getId());
                    break;
                case "TOTAL_HABITS":
                    if (totalCompletedHabits >= a.getRequiredValue())
                        shouldHave.add(a.getId());
                    break;
                case "POINTS":
                    if (totalPoints >= a.getRequiredValue())
                        shouldHave.add(a.getId());
                    break;
            }
        }
        return shouldHave;
    }

    public void checkAndAwardAchievements(User user) {
        // Reconcile achievements to ensure no false unlocks remain
        reconcileUserAchievements(user);
    }

    private void checkStreakAchievements(User user) {
        List<Achievement> streakAchievements = achievementRepository.findByType("STREAK");

        int overallCurrentStreak = calculateOverallCurrentStreak(user);

        for (Achievement achievement : streakAchievements) {
            if (!userAchievementRepository.existsByUserAndAchievement(user, achievement)) {
                if (overallCurrentStreak >= achievement.getRequiredValue()) {
                    awardAchievement(user, achievement);
                }
            }
        }
    }

    // Compute overall current streak (any habit) without depending on
    // HabitLogService to avoid cycles
    private int calculateOverallCurrentStreak(User user) {
        java.time.LocalDate today = java.time.LocalDate.now();
        java.time.LocalDate start = today;

        java.util.List<com.ecohabit.entity.HabitLog> todayLogs = habitLogRepository.findByUserAndDate(user, today);
        boolean hasToday = todayLogs.stream()
                .filter(log -> {
                    java.time.LocalDate logDate = log.getLogDate();
                    java.time.LocalDate createdDate = log.getCreatedAt() != null ? log.getCreatedAt().toLocalDate()
                            : logDate;
                    return !createdDate.isAfter(logDate);
                })
                .anyMatch(com.ecohabit.entity.HabitLog::isCompleted);
        if (!hasToday) {
            start = today.minusDays(1);
        }

        int streak = 0;
        for (int i = 0; i < 365; i++) {
            java.time.LocalDate checkDate = start.minusDays(i);
            java.util.List<com.ecohabit.entity.HabitLog> logsForDate = habitLogRepository.findByUserAndDate(user,
                    checkDate);
            boolean hasCompletedHabit = logsForDate.stream()
                    .filter(log -> {
                        java.time.LocalDate logDate = log.getLogDate();
                        java.time.LocalDate createdDate = log.getCreatedAt() != null ? log.getCreatedAt().toLocalDate()
                                : logDate;
                        return !createdDate.isAfter(logDate);
                    })
                    .anyMatch(com.ecohabit.entity.HabitLog::isCompleted);
            if (hasCompletedHabit) {
                streak++;
            } else {
                break;
            }
        }
        return streak;
    }

    // Longest overall streak in the last year (aligns with dashboard logic)
    private int calculateOverallLongestStreakLastYear(User user) {
        java.time.LocalDate endDate = java.time.LocalDate.now();
        java.time.LocalDate startDate = endDate.minusDays(365);

        java.util.List<com.ecohabit.entity.HabitLog> allLogs = habitLogRepository.findByUserAndLogDateBetween(user,
                startDate, endDate);

        java.util.Map<java.time.LocalDate, Boolean> dailyCompletion = allLogs.stream()
                .collect(java.util.stream.Collectors.groupingBy(
                        com.ecohabit.entity.HabitLog::getLogDate,
                        java.util.stream.Collectors.mapping(com.ecohabit.entity.HabitLog::isCompleted,
                                java.util.stream.Collectors.reducing(false, Boolean::logicalOr))));

        int maxStreak = 0;
        int currentStreak = 0;
        for (java.time.LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
            if (dailyCompletion.getOrDefault(date, false)) {
                currentStreak++;
                maxStreak = Math.max(maxStreak, currentStreak);
            } else {
                currentStreak = 0;
            }
        }
        return maxStreak;
    }

    private long getTotalHabitsCompletedLastYear(User user) {
        java.time.LocalDate endDate = java.time.LocalDate.now();
        java.time.LocalDate startDate = endDate.minusDays(365);
        return habitLogRepository.findByUserAndLogDateBetween(user, startDate, endDate)
                .stream()
                .filter(com.ecohabit.entity.HabitLog::isCompleted)
                .count();
    }

    private void checkTotalHabitsAchievements(User user) {
        Long totalCompletedHabits = habitLogRepository.countCompletedHabitsByUser(user);
        if (totalCompletedHabits == null)
            totalCompletedHabits = 0L;

        List<Achievement> totalHabitsAchievements = achievementRepository.findByType("TOTAL_HABITS");

        for (Achievement achievement : totalHabitsAchievements) {
            if (!userAchievementRepository.existsByUserAndAchievement(user, achievement)) {
                if (totalCompletedHabits >= achievement.getRequiredValue()) {
                    awardAchievement(user, achievement);
                }
            }
        }
    }

    private void checkPointsAchievements(User user) {
        Long totalPoints = habitLogRepository.getTotalPointsByUser(user);
        if (totalPoints == null)
            totalPoints = 0L;

        List<Achievement> pointsAchievements = achievementRepository.findByType("POINTS");

        for (Achievement achievement : pointsAchievements) {
            if (!userAchievementRepository.existsByUserAndAchievement(user, achievement)) {
                if (totalPoints >= achievement.getRequiredValue()) {
                    awardAchievement(user, achievement);
                }
            }
        }
    }

    // Recalculate and sync user achievements based on current state
    @Transactional
    public void reconcileUserAchievements(User user) {
        // compute current state
        int overallCurrentStreak = calculateOverallCurrentStreak(user);
        int overallLongestStreak = calculateOverallLongestStreakLastYear(user);
        long totalCompletedHabits = getTotalHabitsCompletedLastYear(user);
        long totalPoints = java.util.Optional.ofNullable(habitLogRepository.getTotalPointsByUser(user)).orElse(0L);

        // expected achievements per type (align with dashboard numbers shown to user)
        java.util.List<Achievement> all = achievementRepository.findAll();
        java.util.Set<Long> shouldHave = new java.util.HashSet<>();

        for (Achievement a : all) {
            switch (a.getType()) {
                case "STREAK":
                    // Unlock if longest streak (not just current) meets requirement
                    if (overallLongestStreak >= a.getRequiredValue())
                        shouldHave.add(a.getId());
                    break;
                case "TOTAL_HABITS":
                    // Use last-year completed count to match dashboard stats
                    if (totalCompletedHabits >= a.getRequiredValue())
                        shouldHave.add(a.getId());
                    break;
                case "POINTS":
                    if (totalPoints >= a.getRequiredValue())
                        shouldHave.add(a.getId());
                    break;
                default:
                    break;
            }
        }

        // current achievements
        java.util.List<UserAchievement> current = userAchievementRepository.findByUser(user);
        java.util.Set<Long> hasNow = new java.util.HashSet<>();
        for (UserAchievement ua : current)
            hasNow.add(ua.getAchievement().getId());

        // add missing
        for (Achievement a : all) {
            if (shouldHave.contains(a.getId()) && !hasNow.contains(a.getId())) {
                awardAchievement(user, a);
            }
        }

        // remove extras (wrongly unlocked)
        for (UserAchievement ua : current) {
            if (!shouldHave.contains(ua.getAchievement().getId())) {
                userAchievementRepository.delete(ua);
            }
        }
    }

    private boolean shouldAwardStreakAchievement(User user, Achievement achievement) {
        // Placeholder logic - in a real implementation, calculate actual streaks
        // For now, we'll award based on total completed habits as a proxy
        Long totalCompleted = habitLogRepository.getTotalPointsByUser(user);
        return totalCompleted != null && totalCompleted >= achievement.getRequiredValue();
    }

    private void awardAchievement(User user, Achievement achievement) {
        UserAchievement userAchievement = new UserAchievement(user, achievement);
        userAchievementRepository.save(userAchievement);
    }

    public Achievement createAchievement(Achievement achievement) {
        return achievementRepository.save(achievement);
    }

    public void initializeDefaultAchievements() {
        if (achievementRepository.count() == 0) {
            // Create default achievements
            createAchievement(new Achievement("First Step", "Complete your first habit", "TOTAL_HABITS", 1, "seedling",
                    "#4CAF50", 10));
            createAchievement(
                    new Achievement("Getting Started", "Complete 5 habits", "TOTAL_HABITS", 5, "herb", "#4CAF50", 25));
            createAchievement(new Achievement("Habit Builder", "Complete 10 habits", "TOTAL_HABITS", 10,
                    "deciduous_tree", "#4CAF50", 50));
            createAchievement(
                    new Achievement("Eco Warrior", "Complete 25 habits", "TOTAL_HABITS", 25, "trophy", "#FFD700", 100));

            createAchievement(
                    new Achievement("7-Day Streak", "Maintain a 7-day streak", "STREAK", 7, "fire", "#FF5722", 50));
            createAchievement(
                    new Achievement("30-Day Streak", "Maintain a 30-day streak", "STREAK", 30, "zap", "#FF5722", 200));
            createAchievement(new Achievement("100-Day Streak", "Maintain a 100-day streak", "STREAK", 100, "gem",
                    "#9C27B0", 500));

            createAchievement(
                    new Achievement("Point Collector", "Earn 100 points", "POINTS", 100, "moneybag", "#FFC107", 25));
            createAchievement(new Achievement("Point Master", "Earn 500 points", "POINTS", 500, "gem", "#FFC107", 100));
            createAchievement(
                    new Achievement("Point Legend", "Earn 1000 points", "POINTS", 1000, "crown", "#FFC107", 250));
        }
    }
}