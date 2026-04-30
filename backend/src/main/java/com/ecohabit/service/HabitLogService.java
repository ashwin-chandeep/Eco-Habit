package com.ecohabit.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.ecohabit.dto.HabitLogRequest;
import com.ecohabit.entity.Habit;
import com.ecohabit.entity.HabitLog;
import com.ecohabit.entity.User;
import com.ecohabit.repository.HabitLogRepository;
import com.ecohabit.repository.HabitRepository;

@Service
public class HabitLogService {
    
    @Autowired
    private HabitLogRepository habitLogRepository;
    
    @Autowired
    private HabitRepository habitRepository;
    
    @Autowired
    private AchievementService achievementService;
    
    public HabitLog logHabit(User user, HabitLogRequest request) {
        Habit habit = habitRepository.findById(request.getHabitId())
            .orElseThrow(() -> new RuntimeException("Habit not found with id: " + request.getHabitId()));
        
        LocalDate logDate = request.getLogDate() != null ? request.getLogDate() : LocalDate.now();
        
        // Enforce single log per day per habit; update if exists
        Optional<HabitLog> existingLog = habitLogRepository.findByUserAndHabitAndLogDate(user, habit, logDate);
        
        HabitLog habitLog;
        if (existingLog.isPresent()) {
            habitLog = existingLog.get();
            habitLog.setCompleted(request.isCompleted());
            habitLog.setNotes(request.getNotes());
        } else {
            habitLog = new HabitLog(user, habit, logDate, request.isCompleted());
            habitLog.setNotes(request.getNotes());
        }
        
        habitLog = habitLogRepository.save(habitLog);
        
        // Check for achievements after logging completed
        if (request.isCompleted()) {
            achievementService.checkAndAwardAchievements(user);
        }
        
        return habitLog;
    }
    
    public List<HabitLog> getUserHabitLogs(User user, LocalDate startDate, LocalDate endDate) {
        return habitLogRepository.findByUserAndLogDateBetween(user, startDate, endDate);
    }
    
    public List<HabitLog> getUserHabitLogsForDate(User user, LocalDate date) {
        return habitLogRepository.findByUserAndDate(user, date);
    }
    
    public List<HabitLog> getHabitLogsForUserAndHabit(User user, Long habitId, LocalDate startDate, LocalDate endDate) {
        Habit habit = habitRepository.findById(habitId)
            .orElseThrow(() -> new RuntimeException("Habit not found with id: " + habitId));
        
        return habitLogRepository.findByUserAndHabitAndLogDateBetween(user, habit, startDate, endDate);
    }
    
    public Long getTotalPointsByUser(User user) {
        Long points = habitLogRepository.getTotalPointsByUser(user);
        return points != null ? points : 0L;
    }
    
    public int calculateCurrentStreak(User user, Habit habit) {
        // Logs are ordered DESC (most recent first)
        List<HabitLog> logs = habitLogRepository.findCompletedHabitLogsByUserAndHabit(user, habit)
            .stream()
            .filter(log -> {
                LocalDate logDate = log.getLogDate();
                java.time.LocalDate createdDate = log.getCreatedAt() != null ? log.getCreatedAt().toLocalDate() : logDate;
                // Only count logs created on or before their logDate (no backfilling toward streaks)
                return !createdDate.isAfter(logDate);
            })
            .collect(java.util.stream.Collectors.toList());
        if (logs.isEmpty()) return 0;

        int streak = 0;
        LocalDate expected = LocalDate.now();

        for (HabitLog log : logs) {
            LocalDate d = log.getLogDate();
            if (d.equals(expected)) {
                streak++;
                expected = expected.minusDays(1);
            } else if (d.equals(expected.minusDays(1)) && streak == 0) {
                // No completion today but completed yesterday -> start 1-day streak
                streak = 1;
                expected = expected.minusDays(2);
            } else {
                break;
            }
        }
        return streak;
    }
    
    public int calculateLongestStreak(User user, Habit habit) {
        List<HabitLog> logs = habitLogRepository.findCompletedHabitLogsByUserAndHabit(user, habit);
        if (logs.isEmpty()) return 0;

        int maxStreak = 1;
        int currentStreak = 1;

        for (int i = 1; i < logs.size(); i++) {
            LocalDate prev = logs.get(i - 1).getLogDate();
            LocalDate cur = logs.get(i).getLogDate();
            if (prev.minusDays(1).equals(cur)) {
                currentStreak++;
            } else if (!prev.equals(cur)) {
                maxStreak = Math.max(maxStreak, currentStreak);
                currentStreak = 1;
            }
        }
        return Math.max(maxStreak, currentStreak);
    }

    // Overall streak across any habit: counts consecutive days with at least one completed habit
    public int calculateOverallCurrentStreak(User user) {
        LocalDate today = LocalDate.now();
        LocalDate start = today;

        // If no completion today, start from yesterday
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

    // Longest overall streak in the last year
    public int calculateOverallLongestStreak(User user) {
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(365);

        List<HabitLog> allLogs = habitLogRepository.findByUserAndLogDateBetween(user, startDate, endDate);

        // Map per day whether any habit was completed
        java.util.Map<LocalDate, Boolean> dailyCompletion = allLogs.stream()
            .collect(java.util.stream.Collectors.groupingBy(
                HabitLog::getLogDate,
                java.util.stream.Collectors.mapping(HabitLog::isCompleted, java.util.stream.Collectors.reducing(false, Boolean::logicalOr))
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

    public long getTotalCompletedHabits(User user) {
        Long count = habitLogRepository.countCompletedHabitsByUser(user);
        return count != null ? count : 0L;
    }
}