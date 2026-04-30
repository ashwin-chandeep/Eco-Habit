package com.ecohabit.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.ecohabit.entity.Habit;
import com.ecohabit.entity.HabitLog;
import com.ecohabit.entity.User;

@Repository
public interface HabitLogRepository extends JpaRepository<HabitLog, Long> {
    
    List<HabitLog> findByUserAndLogDateBetween(User user, LocalDate startDate, LocalDate endDate);
    
    List<HabitLog> findByUserAndHabitAndLogDateBetween(User user, Habit habit, LocalDate startDate, LocalDate endDate);
    
    Optional<HabitLog> findByUserAndHabitAndLogDate(User user, Habit habit, LocalDate logDate);
    
    @Query("SELECT hl FROM HabitLog hl WHERE hl.user = :user AND hl.logDate = :date")
    List<HabitLog> findByUserAndDate(@Param("user") User user, @Param("date") LocalDate date);
    
    @Query("""
        SELECT COUNT(hl) 
        FROM HabitLog hl 
        WHERE hl.user = :user 
        AND hl.habit = :habit 
        AND hl.completed = true 
        AND hl.logDate >= :startDate 
        AND hl.logDate <= :endDate
        """)
    Long countCompletedHabitLogsByUserAndHabitInDateRange(
        @Param("user") User user, 
        @Param("habit") Habit habit, 
        @Param("startDate") LocalDate startDate, 
        @Param("endDate") LocalDate endDate
    );
    
    @Query("""
        SELECT SUM(hl.pointsEarned) 
        FROM HabitLog hl 
        WHERE hl.user = :user 
        AND hl.completed = true
        """)
    Long getTotalPointsByUser(@Param("user") User user);

    @Query("""
        SELECT COUNT(hl)
        FROM HabitLog hl
        WHERE hl.user = :user
        AND hl.completed = true
        """)
    Long countCompletedHabitsByUser(@Param("user") User user);
    
    @Query("""
        SELECT hl FROM HabitLog hl 
        WHERE hl.user = :user 
        AND hl.habit = :habit 
        AND hl.completed = true 
        ORDER BY hl.logDate DESC
        """)
    List<HabitLog> findCompletedHabitLogsByUserAndHabit(@Param("user") User user, @Param("habit") Habit habit);

    List<HabitLog> findByUserOrderByLogDateDesc(User user);

    @Query("""
        SELECT hl.habit.name, COUNT(hl)
        FROM HabitLog hl
        WHERE hl.completed = true
        GROUP BY hl.habit.name
        ORDER BY COUNT(hl) DESC
        """)
    List<Object[]> getHabitLeaderboard();
}