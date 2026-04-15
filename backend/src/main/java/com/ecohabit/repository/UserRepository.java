package com.ecohabit.repository;

import com.ecohabit.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    Optional<User> findByUsernameIgnoreCase(String username);

    Optional<User> findByEmailIgnoreCase(String email);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    boolean existsByUsernameIgnoreCase(String username);

    boolean existsByEmailIgnoreCase(String email);

    @Query("SELECT u FROM User u WHERE u.emailNotifications = true")
    List<User> findUsersWithEmailNotificationsEnabled();

    @Query("SELECT u FROM User u WHERE u.username LIKE %:search% OR u.email LIKE %:search%")
    List<User> findByUsernameOrEmailContaining(@Param("search") String search);

    @Query("""
            SELECT u, COUNT(hl.id) as totalLogs
            FROM User u
            LEFT JOIN u.habitLogs hl
            WHERE hl.completed = true
            GROUP BY u.id
            ORDER BY totalLogs DESC
            """)
    List<Object[]> findTopUsersByHabitLogs();
}