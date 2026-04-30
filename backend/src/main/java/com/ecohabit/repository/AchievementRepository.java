package com.ecohabit.repository;

import com.ecohabit.entity.Achievement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AchievementRepository extends JpaRepository<Achievement, Long> {
    
    List<Achievement> findByType(String type);
    
    @Query("SELECT a FROM Achievement a ORDER BY a.requiredValue ASC")
    List<Achievement> findAllOrderByRequiredValue();
    
    @Query("""
        SELECT a FROM Achievement a 
        WHERE a.type = :type 
        AND a.requiredValue <= :value 
        ORDER BY a.requiredValue DESC
        """)
    List<Achievement> findEligibleAchievements(@Param("type") String type, @Param("value") Integer value);
}