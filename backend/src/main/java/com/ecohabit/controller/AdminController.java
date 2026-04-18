package com.ecohabit.controller;


import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ecohabit.entity.Achievement;
import com.ecohabit.entity.Habit;
import com.ecohabit.entity.HabitLog;
import com.ecohabit.entity.User;
import com.ecohabit.repository.AchievementRepository;
import com.ecohabit.repository.HabitLogRepository;
import com.ecohabit.repository.HabitRepository;
import com.ecohabit.repository.UserAchievementRepository;
import com.ecohabit.repository.UserRepository;

import jakarta.validation.Valid;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private HabitRepository habitRepository;
    
    @Autowired
    private AchievementRepository achievementRepository;

    @Autowired
    private HabitLogRepository habitLogRepository;

    @Autowired
    private UserAchievementRepository userAchievementRepository;

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @PutMapping("/users/{id}/status")
    public ResponseEntity<User> updateUserStatus(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        User user = userRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("User not found"));
        user.setAccountStatus(payload.get("status"));
        return ResponseEntity.ok(userRepository.save(user));
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<User> updateUserRole(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        User user = userRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("User not found"));
        user.setRole(payload.get("role"));
        return ResponseEntity.ok(userRepository.save(user));
    }

    @GetMapping("/habits")
    public ResponseEntity<List<Habit>> getAllHabits() {
        return ResponseEntity.ok(habitRepository.findAll());
    }

    @PostMapping("/habits")
    public ResponseEntity<Habit> createHabit(@Valid @RequestBody Habit habit) {
        Habit savedHabit = habitRepository.save(habit);
        return ResponseEntity.ok(savedHabit);
    }

    @PutMapping("/habits/{id}")
    public ResponseEntity<Habit> updateHabit(@PathVariable Long id, @Valid @RequestBody Habit habitDetails) {
        Habit habit = habitRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Habit not found"));
        habit.setName(habitDetails.getName());
        habit.setDescription(habitDetails.getDescription());
        habit.setCategory(habitDetails.getCategory());
        habit.setImpactPoints(habitDetails.getImpactPoints());
        habit.setIconName(habitDetails.getIconName());
        return ResponseEntity.ok(habitRepository.save(habit));
    }

    @DeleteMapping("/habits/{id}")
    @Transactional
    public ResponseEntity<?> deleteHabit(@PathVariable Long id) {
        Habit habit = habitRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Habit not found with id " + id));

        // Delete all habit logs that reference this habit first
        List<HabitLog> logs = habitLogRepository.findAll().stream()
                .filter(log -> log.getHabit() != null && log.getHabit().getId().equals(id))
                .toList();
        habitLogRepository.deleteAll(logs);

        habitRepository.delete(habit);
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Habit and associated logs deleted successfully.");
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/achievements")
    public ResponseEntity<Achievement> createAchievement(@Valid @RequestBody Achievement achievement) {
        return ResponseEntity.ok(achievementRepository.save(achievement));
    }
    
    @GetMapping("/achievements")
    public ResponseEntity<List<Achievement>> getAchievements() {
        return ResponseEntity.ok(achievementRepository.findAll());
    }
    
    @DeleteMapping("/achievements/{id}")
    @Transactional
    public ResponseEntity<?> deleteAchievement(@PathVariable Long id) {
        Achievement achievement = achievementRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Achievement not found with id " + id));

        // Delete all user_achievements that reference this achievement first
        userAchievementRepository.deleteAll(
            userAchievementRepository.findByAchievement(achievement)
        );

        achievementRepository.delete(achievement);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Achievement deleted successfully.");
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/users/{id}/logs")
    public ResponseEntity<List<HabitLog>> getUserLogs(@PathVariable Long id) {
        User user = userRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("User not found"));
        return ResponseEntity.ok(habitLogRepository.findByUserOrderByLogDateDesc(user));
    }
    
    @DeleteMapping("/logs/{id}")
    @Transactional
    public ResponseEntity<?> deleteHabitLog(@PathVariable Long id) {
        habitLogRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Habit log not found with id " + id));
        habitLogRepository.deleteById(id);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Habit log deleted successfully.");
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("totalHabits", habitRepository.count());
        stats.put("totalAchievements", achievementRepository.count());
        stats.put("totalLogs", habitLogRepository.count());
        
        List<Object[]> leaderboardRaw = habitLogRepository.getHabitLeaderboard();
        List<Map<String, Object>> leaderboard = leaderboardRaw.stream().map(obj -> {
            Map<String, Object> map = new HashMap<>();
            map.put("name", obj[0]);
            map.put("count", obj[1]);
            return map;
        }).toList();
        stats.put("habitLeaderboard", leaderboard);
        
        return ResponseEntity.ok(stats);
    }
}
