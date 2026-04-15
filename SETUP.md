# EcoHabit Setup Guide

This guide will help you set up and run the EcoHabit platform locally.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Java 17 or higher**
- **Maven 3.6+**
- **MySQL 8.0+**
- **Node.js 16+ and npm**
- **Git**

## Database Setup

1. **Install and start MySQL**
   ```bash
   # On Windows, start MySQL service
   net start mysql
   
   # Or use MySQL Workbench/phpMyAdmin
   ```

2. **Create the database**
   ```sql
   CREATE DATABASE ecohabit_db;
   ```

3. **Run the schema script**
   ```bash
   mysql -u root -p ecohabit_db < database/schema.sql
   ```

4. **Update database credentials**
   Edit `backend/src/main/resources/application.yml`:
   ```yaml
   spring:
     datasource:
       username: your_mysql_username
       password: your_mysql_password
   ```

## Backend Setup (Spring Boot)

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   mvn clean install
   ```

3. **Configure environment variables (optional)**
   Create `backend/src/main/resources/application-local.yml`:
   ```yaml
   jwt:
     secret: your-secret-key-here
   
   spring:
     mail:
       username: your-email@gmail.com
       password: your-app-password
   ```

4. **Run the application**
   ```bash
   mvn spring-boot:run
   ```

   The backend will start on `http://localhost:8080`

## Frontend Setup (React)

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

   The frontend will start on `http://localhost:3000`

## Verification

1. **Check backend health**
   Visit `http://localhost:8080/api/habits` - you should see a list of default habits

2. **Check frontend**
   Visit `http://localhost:3000` - you should see the EcoHabit login page

3. **Test registration**
   - Click "Register" and create a new account
   - Login with your credentials
   - Explore the dashboard and features

## Default Data

The application comes with:
- **22 pre-defined eco habits** across 6 categories
- **14 achievements** for different milestones
- **Sample data** for testing

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Habits
- `GET /api/habits` - Get all habits
- `GET /api/habits/categories` - Get habit categories
- `GET /api/habits/search?q=query` - Search habits

### Habit Logs
- `POST /api/habit-logs` - Log a habit
- `GET /api/habit-logs` - Get user's habit logs
- `GET /api/habit-logs/date/{date}` - Get logs for specific date

### Dashboard
- `GET /api/dashboard` - Get user dashboard data

### Achievements
- `GET /api/achievements` - Get all achievements
- `GET /api/achievements/user` - Get user's achievements

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Ensure MySQL is running
   - Check credentials in `application.yml`
   - Verify database exists

2. **Port Already in Use**
   - Backend: Change port in `application.yml` (`server.port`)
   - Frontend: Set `PORT=3001` environment variable

3. **CORS Issues**
   - Check `cors.allowed-origins` in `application.yml`
   - Ensure frontend URL is included

4. **JWT Token Issues**
   - Clear browser localStorage
   - Check JWT secret configuration

### Development Tips

1. **Hot Reload**
   - Backend: Use `mvn spring-boot:run` with devtools
   - Frontend: `npm start` provides hot reload

2. **Database Changes**
   - Update `schema.sql` for structure changes
   - Use `spring.jpa.hibernate.ddl-auto: update` for development

3. **API Testing**
   - Use Postman or curl for API testing
   - Check browser Network tab for frontend issues

## Production Deployment

### Backend
1. Build JAR file: `mvn clean package`
2. Run with production profile: `java -jar target/ecohabit-backend-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod`

### Frontend
1. Build for production: `npm run build`
2. Serve static files with nginx or Apache
3. Update API URL in production build

### Database
1. Use production MySQL instance
2. Set up proper user permissions
3. Configure SSL connections
4. Set up regular backups

## Environment Variables

### Backend
- `JWT_SECRET` - JWT signing secret
- `MAIL_USERNAME` - Email service username
- `MAIL_PASSWORD` - Email service password
- `DB_URL` - Database URL
- `DB_USERNAME` - Database username
- `DB_PASSWORD` - Database password

### Frontend
- `REACT_APP_API_URL` - Backend API URL

## Features Overview

### Implemented Features
✅ User authentication (JWT)
✅ Habit management and logging
✅ Progress dashboard with statistics
✅ Achievement system with badges
✅ Responsive UI with plain CSS
✅ Database schema with relationships

### Planned Features
🔄 Email notifications and reminders
🔄 Social features (following users)
🔄 Leaderboard with real data
🔄 Advanced streak calculations
🔄 Data export functionality
🔄 Mobile app (React Native)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

For issues and questions:
1. Check this setup guide
2. Review the troubleshooting section
3. Check application logs
4. Create an issue in the repository

## License

This project is licensed under the MIT License.