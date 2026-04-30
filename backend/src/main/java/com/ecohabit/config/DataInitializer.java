package com.ecohabit.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.ecohabit.entity.Habit;
import com.ecohabit.repository.HabitRepository;
import com.ecohabit.service.AchievementService;

@Component
public class DataInitializer implements CommandLineRunner {
    
    @Autowired
    private HabitRepository habitRepository;
    
    @Autowired
    private AchievementService achievementService;
    
    @Override
    public void run(String... args) throws Exception {
        initializeHabits();
        achievementService.initializeDefaultAchievements();
        System.out.println("DataInitializer: Default data initialized");
    }
    
    private void initializeHabits() {
        if (habitRepository.count() == 0) {
            // Transportation habits
            habitRepository.save(new Habit("Bike to Work", "Use bicycle instead of car for commuting", "Transportation", 15, "bike"));
            habitRepository.save(new Habit("Use Public Transport", "Take bus, train, or metro instead of driving", "Transportation", 10, "bus"));
            habitRepository.save(new Habit("Walk Short Distances", "Walk for trips under 1 mile", "Transportation", 8, "walking"));
            habitRepository.save(new Habit("Carpool", "Share rides with others", "Transportation", 12, "car"));
            
            // Energy habits
            habitRepository.save(new Habit("Turn Off Lights", "Switch off lights when leaving a room", "Energy", 5, "lightbulb"));
            habitRepository.save(new Habit("Unplug Electronics", "Unplug devices when not in use", "Energy", 7, "plug"));
            habitRepository.save(new Habit("Use Natural Light", "Work by window light during the day", "Energy", 6, "sun"));
            habitRepository.save(new Habit("Air Dry Clothes", "Hang clothes instead of using dryer", "Energy", 10, "shirt"));
            
            // Water habits
            habitRepository.save(new Habit("Take Shorter Showers", "Limit shower time to 5 minutes", "Water", 8, "shower"));
            habitRepository.save(new Habit("Fix Water Leaks", "Repair any dripping faucets or pipes", "Water", 15, "wrench"));
            habitRepository.save(new Habit("Collect Rainwater", "Use rainwater for plants", "Water", 12, "rain"));
            habitRepository.save(new Habit("Full Dishwasher Loads", "Only run dishwasher when full", "Water", 6, "plate"));
            
            // Waste habits
            habitRepository.save(new Habit("Zero Waste Day", "Produce no waste for the entire day", "Waste", 20, "recycle"));
            habitRepository.save(new Habit("Bring Reusable Bags", "Use cloth/reusable bags for shopping", "Waste", 8, "bag"));
            habitRepository.save(new Habit("Refuse Single-Use Plastic", "Say no to plastic straws, cups, utensils", "Waste", 10, "straw"));
            habitRepository.save(new Habit("Compost Organic Waste", "Compost food scraps and yard waste", "Waste", 12, "seedling"));
            
            // Food habits
            habitRepository.save(new Habit("Eat Plant-Based Meal", "Have at least one vegan meal", "Food", 10, "salad"));
            habitRepository.save(new Habit("Buy Local Produce", "Purchase locally grown fruits and vegetables", "Food", 8, "apple"));
            habitRepository.save(new Habit("Reduce Food Waste", "Use all food before it spoils", "Food", 12, "bread"));
            habitRepository.save(new Habit("Grow Your Own Food", "Tend to a garden or herb plants", "Food", 15, "herb"));
            
            // Nature habits
            habitRepository.save(new Habit("Plant a Tree/Seed", "Plant something that will grow", "Nature", 25, "tree"));
            habitRepository.save(new Habit("Spend Time in Nature", "Spend at least 30 minutes outdoors", "Nature", 8, "evergreen"));
            habitRepository.save(new Habit("Pick Up Litter", "Clean up trash in public spaces", "Nature", 10, "wastebasket"));
            habitRepository.save(new Habit("Support Wildlife", "Create habitat or feed birds", "Nature", 12, "bird"));
        }
    }
}