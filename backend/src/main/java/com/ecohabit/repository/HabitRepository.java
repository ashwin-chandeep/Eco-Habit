package com.ecohabit.repository;

import com.ecohabit.entity.Habit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HabitRepository extends JpaRepository<Habit, Long> {

    List<Habit> findByCategory(String category);

    @Query("SELECT DISTINCT h.category FROM Habit h ORDER BY h.category")
    List<String> findAllCategories();

    @Query("SELECT h FROM Habit h WHERE h.name LIKE %:search% OR h.description LIKE %:search%")
    List<Habit> findByNameOrDescriptionContaining(@Param("search") String search);

    @Query("""
            SELECT h, COUNT(hl.id) as logCount
            FROM Habit h
            LEFT JOIN h.habitLogs hl
            WHERE hl.completed = true
            GROUP BY h.id
            ORDER BY logCount DESC
            """)
    List<Object[]> findMostPopularHabits();
}