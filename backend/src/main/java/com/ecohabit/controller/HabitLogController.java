package com.ecohabit.controller;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ecohabit.dto.HabitLogRequest;
import com.ecohabit.entity.HabitLog;
import com.ecohabit.entity.User;
import com.ecohabit.service.HabitLogService;

import jakarta.validation.Valid;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/habit-logs")
public class HabitLogController {
    
    @Autowired
    private HabitLogService habitLogService;
    
    @PostMapping
    public ResponseEntity<?> logHabit(@Valid @RequestBody HabitLogRequest request, Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            HabitLog habitLog = habitLogService.logHabit(user, request);
            
            return ResponseEntity.ok(habitLog);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @GetMapping
    public ResponseEntity<List<HabitLog>> getUserHabitLogs(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            Authentication authentication) {
        
        User user = (User) authentication.getPrincipal();
        
        if (startDate == null) {
            startDate = LocalDate.now().minusDays(30); // Default to last 30 days
        }
        if (endDate == null) {
            endDate = LocalDate.now();
        }
        
        List<HabitLog> habitLogs = habitLogService.getUserHabitLogs(user, startDate, endDate);
        return ResponseEntity.ok(habitLogs);
    }
    
    @GetMapping("/date/{date}")
    public ResponseEntity<List<HabitLog>> getHabitLogsForDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            Authentication authentication) {
        
        User user = (User) authentication.getPrincipal();
        List<HabitLog> habitLogs = habitLogService.getUserHabitLogsForDate(user, date);
        return ResponseEntity.ok(habitLogs);
    }
    
    @GetMapping("/habit/{habitId}")
    public ResponseEntity<List<HabitLog>> getHabitLogsForHabit(
            @PathVariable Long habitId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            Authentication authentication) {
        
        User user = (User) authentication.getPrincipal();
        
        if (startDate == null) {
            startDate = LocalDate.now().minusDays(30);
        }
        if (endDate == null) {
            endDate = LocalDate.now();
        }
        
        List<HabitLog> habitLogs = habitLogService.getHabitLogsForUserAndHabit(user, habitId, startDate, endDate);
        return ResponseEntity.ok(habitLogs);
    }
}