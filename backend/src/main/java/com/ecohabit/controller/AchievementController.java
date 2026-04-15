package com.ecohabit.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ecohabit.entity.Achievement;
import com.ecohabit.entity.User;
import com.ecohabit.entity.UserAchievement;
import com.ecohabit.service.AchievementService;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/achievements")
public class AchievementController {
    
    @Autowired
    private AchievementService achievementService;
    
    @GetMapping
    public ResponseEntity<List<Achievement>> getAllAchievements() {
        List<Achievement> achievements = achievementService.getAllAchievements();
        return ResponseEntity.ok(achievements);
    }
    
    @GetMapping("/user")
    public ResponseEntity<List<UserAchievement>> getUserAchievements(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        // Reconcile to ensure only valid achievements are returned
        achievementService.reconcileUserAchievements(user);
        List<UserAchievement> userAchievements = achievementService.getUserAchievements(user);
        return ResponseEntity.ok(userAchievements);
    }
}