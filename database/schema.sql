-- EcoHabit Database Schema
-- MySQL Database Schema for Eco-Habit Builder Platform

-- Create database
CREATE DATABASE IF NOT EXISTS ecohabit_db;
USE ecohabit_db;

-- Users table
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(120) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email_notifications BOOLEAN DEFAULT TRUE,
    reminder_time VARCHAR(5) DEFAULT '09:00',
    role VARCHAR(20) DEFAULT 'ROLE_USER',
    account_status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_created_at (created_at)
);

-- Habits table
CREATE TABLE habits (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    impact_points INT DEFAULT 10,
    icon_name VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_category (category),
    INDEX idx_name (name),
    FULLTEXT idx_search (name, description)
);

-- Habit logs table
CREATE TABLE habit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    habit_id BIGINT NOT NULL,
    log_date DATE NOT NULL,
    completed BOOLEAN DEFAULT TRUE,
    notes TEXT,
    points_earned INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE,
    
    UNIQUE KEY unique_user_habit_date (user_id, habit_id, log_date),
    INDEX idx_user_date (user_id, log_date),
    INDEX idx_habit_date (habit_id, log_date),
    INDEX idx_completed (completed)
);

-- Achievements table
CREATE TABLE achievements (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL, -- STREAK, TOTAL_HABITS, POINTS, etc.
    required_value INT NOT NULL,
    badge_icon VARCHAR(50),
    badge_color VARCHAR(20),
    points_reward INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_type (type),
    INDEX idx_required_value (required_value)
);

-- User achievements table
CREATE TABLE user_achievements (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    achievement_id BIGINT NOT NULL,
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE,
    
    UNIQUE KEY unique_user_achievement (user_id, achievement_id),
    INDEX idx_user_earned (user_id, earned_at),
    INDEX idx_achievement (achievement_id)
);



-- Insert default admin user
INSERT INTO users (username, email, password, first_name, last_name, role)
VALUES ('admin', 'ashwinchandeepbaburajan@gmail.com', '$2a$10$1pbw3syxwQmvSIroiUhLOOZQYed3diAv2WpL3ssLGaSYpGkwliwxu', 'Admin', 'User', 'ROLE_ADMIN');

-- Insert default habits
INSERT INTO habits (name, description, category, impact_points, icon_name) VALUES
-- Transportation habits
('Bike to Work', 'Use bicycle instead of car for commuting', 'Transportation', 15, 'bike'),
('Use Public Transport', 'Take bus, train, or metro instead of driving', 'Transportation', 10, 'bus'),
('Walk Short Distances', 'Walk for trips under 1 mile', 'Transportation', 8, 'walking'),
('Carpool', 'Share rides with others', 'Transportation', 12, 'car'),

-- Energy habits
('Turn Off Lights', 'Switch off lights when leaving a room', 'Energy', 5, 'lightbulb'),
('Unplug Electronics', 'Unplug devices when not in use', 'Energy', 7, 'plug'),
('Use Natural Light', 'Work by window light during the day', 'Energy', 6, 'sun'),
('Air Dry Clothes', 'Hang clothes instead of using dryer', 'Energy', 10, 'shirt'),

-- Water habits
('Take Shorter Showers', 'Limit shower time to 5 minutes', 'Water', 8, 'shower'),
('Fix Water Leaks', 'Repair any dripping faucets or pipes', 'Water', 15, 'wrench'),
('Collect Rainwater', 'Use rainwater for plants', 'Water', 12, 'rain'),
('Full Dishwasher Loads', 'Only run dishwasher when full', 'Water', 6, 'plate'),

-- Waste habits
('Zero Waste Day', 'Produce no waste for the entire day', 'Waste', 20, 'recycle'),
('Bring Reusable Bags', 'Use cloth/reusable bags for shopping', 'Waste', 8, 'bag'),
('Refuse Single-Use Plastic', 'Say no to plastic straws, cups, utensils', 'Waste', 10, 'straw'),
('Compost Organic Waste', 'Compost food scraps and yard waste', 'Waste', 12, 'seedling'),

-- Food habits
('Eat Plant-Based Meal', 'Have at least one vegan meal', 'Food', 10, 'salad'),
('Buy Local Produce', 'Purchase locally grown fruits and vegetables', 'Food', 8, 'apple'),
('Reduce Food Waste', 'Use all food before it spoils', 'Food', 12, 'bread'),
('Grow Your Own Food', 'Tend to a garden or herb plants', 'Food', 15, 'herb'),

-- Nature habits
('Plant a Tree/Seed', 'Plant something that will grow', 'Nature', 25, 'tree'),
('Spend Time in Nature', 'Spend at least 30 minutes outdoors', 'Nature', 8, 'evergreen'),
('Pick Up Litter', 'Clean up trash in public spaces', 'Nature', 10, 'wastebasket'),
('Support Wildlife', 'Create habitat or feed birds', 'Nature', 12, 'bird');

-- Insert default achievements
INSERT INTO achievements (name, description, type, required_value, badge_icon, badge_color, points_reward) VALUES
-- Habit completion achievements
('First Step', 'Complete your first habit', 'TOTAL_HABITS', 1, 'seedling', '#4CAF50', 10),
('Getting Started', 'Complete 5 habits', 'TOTAL_HABITS', 5, 'herb', '#4CAF50', 25),
('Habit Builder', 'Complete 10 habits', 'TOTAL_HABITS', 10, 'deciduous_tree', '#4CAF50', 50),
('Eco Warrior', 'Complete 25 habits', 'TOTAL_HABITS', 25, 'trophy', '#FFD700', 100),
('Planet Protector', 'Complete 50 habits', 'TOTAL_HABITS', 50, 'earth_americas', '#2196F3', 200),
('Sustainability Champion', 'Complete 100 habits', 'TOTAL_HABITS', 100, 'crown', '#9C27B0', 500),

-- Streak achievements
('7-Day Streak', 'Maintain a 7-day streak', 'STREAK', 7, 'fire', '#FF5722', 50),
('30-Day Streak', 'Maintain a 30-day streak', 'STREAK', 30, 'zap', '#FF5722', 200),
('100-Day Streak', 'Maintain a 100-day streak', 'STREAK', 100, 'gem', '#9C27B0', 500),
('365-Day Streak', 'Maintain a full year streak', 'STREAK', 365, 'star2', '#FFD700', 1000),

-- Points achievements
('Point Collector', 'Earn 100 points', 'POINTS', 100, 'moneybag', '#FFC107', 25),
('Point Master', 'Earn 500 points', 'POINTS', 500, 'gem', '#FFC107', 100),
('Point Legend', 'Earn 1000 points', 'POINTS', 1000, 'crown', '#FFC107', 250),
('Point Champion', 'Earn 2500 points', 'POINTS', 2500, 'trophy', '#FFC107', 500);

-- Create views for common queries
CREATE VIEW user_stats AS
SELECT 
    u.id,
    u.username,
    u.first_name,
    u.last_name,
    COALESCE(SUM(hl.points_earned), 0) as total_points,
    COUNT(CASE WHEN hl.completed = TRUE THEN 1 END) as total_habits_completed,
    COUNT(DISTINCT ua.achievement_id) as achievements_count,
    u.created_at as join_date
FROM users u
LEFT JOIN habit_logs hl ON u.id = hl.user_id
LEFT JOIN user_achievements ua ON u.id = ua.user_id
GROUP BY u.id, u.username, u.first_name, u.last_name, u.created_at;

-- Create view for leaderboard
CREATE VIEW leaderboard AS
SELECT 
    us.*,
    RANK() OVER (ORDER BY us.total_points DESC) as points_rank,
    RANK() OVER (ORDER BY us.achievements_count DESC) as achievements_rank
FROM user_stats us
ORDER BY us.total_points DESC;

-- Create indexes for performance
CREATE INDEX idx_habit_logs_user_completed ON habit_logs(user_id, completed, log_date);
CREATE INDEX idx_habit_logs_points ON habit_logs(points_earned);
CREATE INDEX idx_user_achievements_earned ON user_achievements(earned_at);

-- Create stored procedures for common operations

-- Procedure to calculate user's current streak
DELIMITER //
CREATE PROCEDURE GetUserCurrentStreak(IN user_id BIGINT, OUT current_streak INT)
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE log_date DATE;
    DECLARE streak_count INT DEFAULT 0;
    DECLARE check_date DATE DEFAULT CURDATE();
    
    -- Check if user has any completed habits today or yesterday
    SELECT COUNT(*) INTO streak_count
    FROM habit_logs 
    WHERE user_id = user_id 
    AND log_date = check_date 
    AND completed = TRUE;
    
    -- If no habits today, check yesterday
    IF streak_count = 0 THEN
        SET check_date = DATE_SUB(CURDATE(), INTERVAL 1 DAY);
        SELECT COUNT(*) INTO streak_count
        FROM habit_logs 
        WHERE user_id = user_id 
        AND log_date = check_date 
        AND completed = TRUE;
        
        -- If no habits yesterday either, streak is 0
        IF streak_count = 0 THEN
            SET current_streak = 0;
        ELSE
            SET current_streak = 1;
            SET check_date = DATE_SUB(check_date, INTERVAL 1 DAY);
        END IF;
    ELSE
        SET current_streak = 1;
        SET check_date = DATE_SUB(check_date, INTERVAL 1 DAY);
    END IF;
    
    -- Count consecutive days with completed habits
    WHILE streak_count > 0 AND current_streak < 1000 DO -- Prevent infinite loop
        SELECT COUNT(*) INTO streak_count
        FROM habit_logs 
        WHERE user_id = user_id 
        AND log_date = check_date 
        AND completed = TRUE;
        
        IF streak_count > 0 THEN
            SET current_streak = current_streak + 1;
            SET check_date = DATE_SUB(check_date, INTERVAL 1 DAY);
        END IF;
    END WHILE;
END //
DELIMITER ;

-- Procedure to award achievements
DELIMITER //
CREATE PROCEDURE CheckAndAwardAchievements(IN user_id BIGINT)
BEGIN
    DECLARE total_habits INT DEFAULT 0;
    DECLARE total_points INT DEFAULT 0;
    DECLARE current_streak INT DEFAULT 0;
    
    -- Get user stats
    SELECT 
        COUNT(CASE WHEN completed = TRUE THEN 1 END),
        COALESCE(SUM(points_earned), 0)
    INTO total_habits, total_points
    FROM habit_logs 
    WHERE user_id = user_id;
    
    -- Get current streak
    CALL GetUserCurrentStreak(user_id, current_streak);
    
    -- Award habit completion achievements
    INSERT IGNORE INTO user_achievements (user_id, achievement_id)
    SELECT user_id, a.id
    FROM achievements a
    WHERE a.type = 'TOTAL_HABITS' 
    AND a.required_value <= total_habits;
    
    -- Award points achievements
    INSERT IGNORE INTO user_achievements (user_id, achievement_id)
    SELECT user_id, a.id
    FROM achievements a
    WHERE a.type = 'POINTS' 
    AND a.required_value <= total_points;
    
    -- Award streak achievements
    INSERT IGNORE INTO user_achievements (user_id, achievement_id)
    SELECT user_id, a.id
    FROM achievements a
    WHERE a.type = 'STREAK' 
    AND a.required_value <= current_streak;
    
END //
DELIMITER ;