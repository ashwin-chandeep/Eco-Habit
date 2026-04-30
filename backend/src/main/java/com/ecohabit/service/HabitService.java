package com.ecohabit.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.ecohabit.entity.Habit;
import com.ecohabit.repository.HabitRepository;

@Service
public class HabitService {
    
    @Autowired
    private HabitRepository habitRepository;
    
    public List<Habit> getAllHabits() {
        return habitRepository.findAll();
    }
    
    public Optional<Habit> getHabitById(Long id) {
        return habitRepository.findById(id);
    }
    
    public List<Habit> getHabitsByCategory(String category) {
        return habitRepository.findByCategory(category);
    }
    
    public List<String> getAllCategories() {
        return habitRepository.findAllCategories();
    }
    
    public List<Habit> searchHabits(String search) {
        return habitRepository.findByNameOrDescriptionContaining(search);
    }
    
    public List<Object[]> getMostPopularHabits() {
        return habitRepository.findMostPopularHabits();
    }
    
    public Habit createHabit(Habit habit) {
        return habitRepository.save(habit);
    }
    
    public Habit updateHabit(Long id, Habit habitDetails) {
        return habitRepository.findById(id)
            .map(habit -> {
                habit.setName(habitDetails.getName());
                habit.setDescription(habitDetails.getDescription());
                habit.setCategory(habitDetails.getCategory());
                habit.setImpactPoints(habitDetails.getImpactPoints());
                habit.setIconName(habitDetails.getIconName());
                return habitRepository.save(habit);
            })
            .orElseThrow(() -> new RuntimeException("Habit not found with id: " + id));
    }
    
    public void deleteHabit(Long id) {
        habitRepository.deleteById(id);
    }
}