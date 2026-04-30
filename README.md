# Eco-Habit Builder Platform

A web application where users can build daily eco-conscious habits and track their environmental impact over time.

## Tech Stack

- **Backend**: Java + Spring Boot
- **Database**: MySQL
- **Frontend**: React JS, HTML, CSS, JavaScript (plain CSS, no frameworks)

## Features

1. **User Authentication & Profiles** - Registration, login, and user management
2. **Habit Management** - Select and track eco-habits with streaks
3. **Progress Dashboard** - Visual progress charts and habit tracking
4. **Gamification & Achievements** - Badges and milestones
5. **Community Overview** - Leaderboards and social features
6. **Notifications & Reminders** - Email reminders for habit logging

## Project Structure

```
EcoHabit/
├── backend/                 # Spring Boot application
│   ├── src/main/java/
│   ├── src/main/resources/
│   └── pom.xml
├── frontend/                # React application
│   ├── src/
│   ├── public/
│   └── package.json
└── database/               # SQL scripts and schema
```

## Getting Started

### Backend Setup
1. Navigate to `backend/` directory
2. Run `mvn spring-boot:run`

### Frontend Setup
1. Navigate to `frontend/` directory
2. Run `npm install`
3. Run `npm start`

### Database Setup
1. Create MySQL database `ecohabit_db`
2. Run SQL scripts from `database/` directory

## API Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/habits` - Get available habits
- `POST /api/habit-logs` - Log habit completion
- `GET /api/dashboard` - Get user dashboard data
- `GET /api/achievements` - Get user achievements
- `GET /api/leaderboard` - Get community leaderboard