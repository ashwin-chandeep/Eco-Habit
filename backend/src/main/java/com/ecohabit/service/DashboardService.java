package com.ecohabit.service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.ecohabit.dto.DashboardResponse;
import com.ecohabit.entity.Habit;
import com.ecohabit.entity.HabitLog;
import com.ecohabit.entity.User;
import com.ecohabit.repository.HabitLogRepository;
import com.ecohabit.repository.HabitRepository;
import com.ecohabit.repository.UserAchievementRepository;

@Service
public class DashboardService {
    
    @Autowired
    private HabitLogRepository habitLogRepository;
    
    @Autowired
    private HabitRepository habitRepository;
    
    @Autowired
    private UserAchievementRepository userAchievementRepository;
    
    @Autowired
    private HabitLogService habitLogService;
    
    public DashboardResponse getUserDashboard(User user) {
        DashboardResponse dashboard = new DashboardResponse();
        
        // Get total points
        dashboard.setTotalPoints(habitLogService.getTotalPointsByUser(user));
        
        // Get achievements count
        dashboard.setAchievementsCount(userAchievementRepository.countByUser(user).intValue());
        
        // Get habit streaks
        List<DashboardResponse.HabitStreakInfo> habitStreaks = getHabitStreaks(user);
        dashboard.setHabitStreaks(habitStreaks);
        
        // Calculate overall current and longest streaks
        dashboard.setCurrentStreak(calculateOverallCurrentStreak(user));
        dashboard.setLongestStreak(calculateOverallLongestStreak(user));
        
        // Get total habits completed
        dashboard.setTotalHabitsCompleted(getTotalHabitsCompleted(user));
        
        // Get recent activity
        dashboard.setRecentActivity(getRecentActivity(user));
        
        // Get weekly progress
        dashboard.setWeeklyProgress(getWeeklyProgress(user));
        
        return dashboard;
    }
    
    private List<DashboardResponse.HabitStreakInfo> getHabitStreaks(User user) {
        List<Habit> allHabits = habitRepository.findAll();
        
        return allHabits.stream()
            .map(habit -> {
                int currentStreak = habitLogService.calculateCurrentStreak(user, habit);
                int longestStreak = habitLogService.calculateLongestStreak(user, habit);
                
                return new DashboardResponse.HabitStreakInfo(
                    habit.getId(),
                    habit.getName(),
                    currentStreak,
                    longestStreak,
                    habit.getCategory(),
                    habit.getIconName()
                );
            })
            .filter(streak -> streak.getCurrentStreak() > 0 || streak.getLongestStreak() > 0)
            .collect(Collectors.toList());
    }
    
    private Integer calculateOverallCurrentStreak(User user) {
        // Count consecutive days up to today if completed, otherwise up to yesterday
        LocalDate today = LocalDate.now();
        LocalDate start = today;

        List<HabitLog> todayLogs = habitLogRepository.findByUserAndDate(user, today);
        boolean hasToday = todayLogs.stream()
            .filter(log -> {
                LocalDate logDate = log.getLogDate();
                java.time.LocalDate createdDate = log.getCreatedAt() != null ? log.getCreatedAt().toLocalDate() : logDate;
                return !createdDate.isAfter(logDate);
            })
            .anyMatch(HabitLog::isCompleted);
        if (!hasToday) {
            start = today.minusDays(1);
        }

        int streak = 0;
        for (int i = 0; i < 365; i++) { // Check up to a year back
            LocalDate checkDate = start.minusDays(i);
            List<HabitLog> logsForDate = habitLogRepository.findByUserAndDate(user, checkDate);
            boolean hasCompletedHabit = logsForDate.stream()
                .filter(log -> {
                    LocalDate logDate = log.getLogDate();
                    java.time.LocalDate createdDate = log.getCreatedAt() != null ? log.getCreatedAt().toLocalDate() : logDate;
                    return !createdDate.isAfter(logDate);
                })
                .anyMatch(HabitLog::isCompleted);
            if (hasCompletedHabit) {
                streak++;
            } else {
                break;
            }
        }
        return streak;
    }
    
    private Integer calculateOverallLongestStreak(User user) {
        // This is a simplified calculation - in a real implementation, 
        // you'd want to calculate the actual longest streak across all time
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(365); // Check last year
        
        List<HabitLog> allLogs = habitLogRepository.findByUserAndLogDateBetween(user, startDate, endDate);
        
        Map<LocalDate, Boolean> dailyCompletion = allLogs.stream()
            .collect(Collectors.groupingBy(
                HabitLog::getLogDate,
                Collectors.mapping(HabitLog::isCompleted, Collectors.reducing(false, Boolean::logicalOr))
            ));
        
        int maxStreak = 0;
        int currentStreak = 0;
        
        for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
            if (dailyCompletion.getOrDefault(date, false)) {
                currentStreak++;
                maxStreak = Math.max(maxStreak, currentStreak);
            } else {
                currentStreak = 0;
            }
        }
        
        return maxStreak;
    }
    
    private Integer getTotalHabitsCompleted(User user) {
        return habitLogRepository.findByUserAndLogDateBetween(user, LocalDate.now().minusYears(1), LocalDate.now())
            .stream()
            .mapToInt(log -> log.isCompleted() ? 1 : 0)
            .sum();
    }
    
    private List<DashboardResponse.RecentActivityInfo> getRecentActivity(User user) {
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(7);
        
        List<HabitLog> recentLogs = habitLogRepository.findByUserAndLogDateBetween(user, startDate, endDate);
        
        return recentLogs.stream()
            .sorted((a, b) -> b.getLogDate().compareTo(a.getLogDate()))
            .limit(10)
            .map(log -> new DashboardResponse.RecentActivityInfo(
                log.getHabit().getName(),
                log.getLogDate().format(DateTimeFormatter.ofPattern("MMM dd")),
                log.isCompleted(),
                log.getPointsEarned()
            ))
            .collect(Collectors.toList());
    }
    
    private Map<String, Integer> getWeeklyProgress(User user) {
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(6); // Last 7 days
        
        Map<String, Integer> weeklyProgress = new LinkedHashMap<>();
        
        for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
            List<HabitLog> logsForDate = habitLogRepository.findByUserAndDate(user, date);
            int completedCount = (int) logsForDate.stream().filter(HabitLog::isCompleted).count();
            
            String dayName = date.format(DateTimeFormatter.ofPattern("EEE"));
            weeklyProgress.put(dayName, completedCount);
        }
        
        return weeklyProgress;
    }
}