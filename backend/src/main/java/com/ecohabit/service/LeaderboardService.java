package com.ecohabit.service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.ecohabit.dto.LeaderboardEntry;
import com.ecohabit.entity.HabitLog;
import com.ecohabit.entity.User;
import com.ecohabit.repository.HabitLogRepository;
import com.ecohabit.repository.HabitRepository;
import com.ecohabit.repository.UserAchievementRepository;
import com.ecohabit.repository.UserRepository;

@Service
public class LeaderboardService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private HabitLogRepository habitLogRepository;

    @Autowired
    private UserAchievementRepository userAchievementRepository;

    @Autowired
    private HabitRepository habitRepository;

    @Autowired
    private HabitLogService habitLogService;

    public List<LeaderboardEntry> getLeaderboard(String metric, int limit) {
        // Load all users
        List<User> users = userRepository.findAll();
        if (users.isEmpty()) {
            return List.of();
        }

        // Preload totals by user for performance (H2 dev scale)
        Map<Long, Long> pointsByUser = users.stream().collect(Collectors.toMap(
                User::getId,
                u -> {
                    Long p = habitLogRepository.getTotalPointsByUser(u);
                    return p == null ? 0L : p;
                }
        ));

        Map<Long, Integer> achievementsByUser = users.stream().collect(Collectors.toMap(
                User::getId,
                u -> userAchievementRepository.countByUser(u).intValue()
        ));

        // For streaks, compute overall current streak (any habit per day)
        Map<Long, Integer> streakByUser = users.stream().collect(Collectors.toMap(
                User::getId,
                u -> calculateOverallCurrentStreak(u)
        ));

        List<LeaderboardEntry> entries = new ArrayList<>();
        for (User u : users) {
            LeaderboardEntry e = new LeaderboardEntry(
                    u.getId(),
                    u.getUsername(),
                    u.getFirstName() == null ? "" : u.getFirstName(),
                    u.getLastName() == null ? "" : u.getLastName(),
                    pointsByUser.getOrDefault(u.getId(), 0L),
                    streakByUser.getOrDefault(u.getId(), 0),
                    achievementsByUser.getOrDefault(u.getId(), 0)
            );
            entries.add(e);
        }

        Comparator<LeaderboardEntry> comparator;
        switch (metric == null ? "points" : metric) {
            case "streak":
                comparator = Comparator.comparing(LeaderboardEntry::getStreak).reversed()
                        .thenComparing(LeaderboardEntry::getPoints, Comparator.reverseOrder());
                break;
            case "achievements":
                comparator = Comparator.comparing(LeaderboardEntry::getAchievements).reversed()
                        .thenComparing(LeaderboardEntry::getPoints, Comparator.reverseOrder());
                break;
            case "points":
            default:
                comparator = Comparator.comparing(LeaderboardEntry::getPoints).reversed()
                        .thenComparing(LeaderboardEntry::getStreak, Comparator.reverseOrder());
        }

        return entries.stream()
                .sorted(comparator)
                .limit(Math.max(limit, 0))
                .collect(Collectors.toList());
    }

    private Integer calculateOverallCurrentStreak(User user) {
        // Mirror DashboardService logic with strict backfill filtering (createdAt <= logDate)
        LocalDate today = LocalDate.now();
        LocalDate start = today;

        // If no valid completion today, start from yesterday
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
        for (int i = 0; i < 365; i++) {
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
}