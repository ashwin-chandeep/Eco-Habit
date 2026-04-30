package com.ecohabit.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.NotNull;

public class HabitLogRequest {
    
    @NotNull
    private Long habitId;
    
    private LocalDate logDate;
    
    private boolean completed = true;
    
    private String notes;
    
    // Constructors
    public HabitLogRequest() {}
    
    public HabitLogRequest(Long habitId, LocalDate logDate, boolean completed, String notes) {
        this.habitId = habitId;
        this.logDate = logDate;
        this.completed = completed;
        this.notes = notes;
    }
    
    // Getters and Setters
    public Long getHabitId() { return habitId; }
    public void setHabitId(Long habitId) { this.habitId = habitId; }
    
    public LocalDate getLogDate() { return logDate; }
    public void setLogDate(LocalDate logDate) { this.logDate = logDate; }
    
    public boolean isCompleted() { return completed; }
    public void setCompleted(boolean completed) { this.completed = completed; }
    
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}