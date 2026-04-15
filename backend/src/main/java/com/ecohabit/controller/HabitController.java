package com.ecohabit.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ecohabit.entity.Habit;
import com.ecohabit.service.HabitService;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/habits")
public class HabitController {
    
    @Autowired
    private HabitService habitService;
    
    @GetMapping
    public ResponseEntity<List<Habit>> getAllHabits() {
        List<Habit> habits = habitService.getAllHabits();
        return ResponseEntity.ok(habits);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Habit> getHabitById(@PathVariable Long id) {
        return habitService.getHabitById(id)
            .map(habit -> ResponseEntity.ok().body(habit))
            .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/category/{category}")
    public ResponseEntity<List<Habit>> getHabitsByCategory(@PathVariable String category) {
        List<Habit> habits = habitService.getHabitsByCategory(category);
        return ResponseEntity.ok(habits);
    }
    
    @GetMapping("/categories")
    public ResponseEntity<List<String>> getAllCategories() {
        List<String> categories = habitService.getAllCategories();
        return ResponseEntity.ok(categories);
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<Habit>> searchHabits(@RequestParam String q) {
        List<Habit> habits = habitService.searchHabits(q);
        return ResponseEntity.ok(habits);
    }
    
    @GetMapping("/popular")
    public ResponseEntity<List<Object[]>> getMostPopularHabits() {
        List<Object[]> popularHabits = habitService.getMostPopularHabits();
        return ResponseEntity.ok(popularHabits);
    }
}