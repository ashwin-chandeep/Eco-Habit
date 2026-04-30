package com.ecohabit.repository;

import com.ecohabit.entity.UserAchievement;
import com.ecohabit.entity.User;
import com.ecohabit.entity.Achievement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserAchievementRepository extends JpaRepository<UserAchievement, Long> {
    
    List<UserAchievement> findByUser(User user);
    
    List<UserAchievement> findByAchievement(Achievement achievement);
    
    Optional<UserAchievement> findByUserAndAchievement(User user, Achievement achievement);
    
    boolean existsByUserAndAchievement(User user, Achievement achievement);
    
    @Query("SELECT COUNT(ua) FROM UserAchievement ua WHERE ua.user = :user")
    Long countByUser(@Param("user") User user);
    
    @Query("""
        SELECT ua FROM UserAchievement ua 
        JOIN FETCH ua.achievement 
        WHERE ua.user = :user 
        ORDER BY ua.earnedAt DESC
        """)
    List<UserAchievement> findByUserWithAchievements(@Param("user") User user);
}