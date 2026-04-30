import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { useInView } from 'react-intersection-observer';
import { dashboardAPI, handleAPIError } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { getIconEmoji } from '../utils/iconMapping';
import PageTransition from '../components/PageTransition';
import GlassCard from '../components/GlassCard';
import SkeletonLoader from '../components/SkeletonLoader';
import ScrollReveal from '../components/ScrollReveal';

const AnimatedStat = ({ icon, value, label, delay = 0 }) => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.3 });
  return (
    <motion.div
      ref={ref}
      className="stat-card-premium"
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -4, boxShadow: 'var(--shadow-glow)' }}
    >
      <div className="stat-icon-wrap" style={{ background: 'var(--gradient-primary)' }}>
        <span className="stat-icon-emoji">{icon}</span>
      </div>
      <div className="stat-value-premium">
        {inView ? <CountUp end={value} duration={2} separator="," /> : 0}
      </div>
      <div className="stat-label-premium">{label}</div>
    </motion.div>
  );
};

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const data = await dashboardAPI.getUserDashboard();
        setDashboardData(data);
      } catch (err) {
        setError(handleAPIError(err));
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <PageTransition>
        <div className="container">
          <div className="page-header">
            <div className="skeleton-line skeleton-title" style={{ width: '40%', margin: '0 auto 0.5rem' }} />
            <div className="skeleton-line skeleton-text" style={{ width: '30%', margin: '0 auto' }} />
          </div>
          <SkeletonLoader type="stats" count={4} />
          <div style={{ marginTop: '1.5rem' }}>
            <SkeletonLoader type="card" count={2} />
          </div>
        </div>
      </PageTransition>
    );
  }

  if (error) {
    return (
      <PageTransition>
        <div className="container">
          <motion.div className="alert alert-error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {error}
          </motion.div>
        </div>
      </PageTransition>
    );
  }

  if (!dashboardData) {
    return (
      <PageTransition>
        <div className="container">
          <motion.div className="empty-state" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="empty-state-icon">📊</div>
            <h3 className="empty-state-title">No Data Available</h3>
            <p className="empty-state-description">Start logging your habits to see your progress here.</p>
            <Link to="/log" className="btn btn-primary">Log Your First Habit</Link>
          </motion.div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="container">
        <motion.div className="page-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="page-title">Welcome back, {user?.firstName || user?.username}! 👋</h1>
          <p className="page-subtitle">Here's your eco-habit progress overview</p>
        </motion.div>

        {/* Stats */}
        <div className="dashboard-grid">
          <AnimatedStat icon="⭐" value={dashboardData.totalPoints || 0} label="Total Points" delay={0} />
          <AnimatedStat icon="🔥" value={dashboardData.currentStreak || 0} label="Current Streak" delay={0.1} />
          <AnimatedStat icon="🏔️" value={dashboardData.longestStreak || 0} label="Longest Streak" delay={0.2} />
          <AnimatedStat icon="🏅" value={dashboardData.achievementsCount || 0} label="Achievements" delay={0.3} />
        </div>

        <div className="row">
          {/* Weekly Progress */}
          <div className="col-2">
            <ScrollReveal variant="fadeLeft" delay={0.1} showLeafDecor>
              <GlassCard delay={0.2}>
                <div className="card-header">
                  <h3 className="card-title">📈 Weekly Progress</h3>
                </div>
                {dashboardData.weeklyProgress && Object.keys(dashboardData.weeklyProgress).length > 0 ? (
                  <div className="weekly-progress">
                    {Object.entries(dashboardData.weeklyProgress).map(([day, count], i) => (
                      <motion.div
                        key={day}
                        className="day-progress"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + i * 0.05 }}
                      >
                        <div className="day-name">{day}</div>
                        <div className="day-bar">
                          <motion.div
                            className="day-fill"
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(count * 20, 100)}%` }}
                            transition={{ delay: 0.5 + i * 0.1, duration: 0.6, ease: 'easeOut' }}
                          />
                        </div>
                        <div className="day-count">{count}</div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: 'var(--text-muted)' }}>No activity this week yet.</p>
                )}
              </GlassCard>
            </ScrollReveal>
          </div>

          {/* Recent Activity */}
          <div className="col-2">
            <ScrollReveal variant="fadeRight" delay={0.15} showLeafDecor>
              <GlassCard delay={0.3}>
                <div className="card-header">
                  <h3 className="card-title">🕐 Recent Activity</h3>
                </div>
                {dashboardData.recentActivity && dashboardData.recentActivity.length > 0 ? (
                  <div className="recent-activity">
                    {dashboardData.recentActivity.map((activity, index) => (
                      <motion.div
                        key={index}
                        className="activity-item"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + index * 0.05 }}
                      >
                        <div className="activity-icon">{activity.completed ? '✅' : '❌'}</div>
                        <div className="activity-details">
                          <div className="activity-name">{activity.habitName}</div>
                          <div className="activity-date">{activity.date}</div>
                        </div>
                        <div className="activity-points">+{activity.pointsEarned || 0}</div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: 'var(--text-muted)' }}>No recent activity.</p>
                )}
              </GlassCard>
            </ScrollReveal>
          </div>
        </div>

        {/* Habit Streaks */}
        {dashboardData.habitStreaks && dashboardData.habitStreaks.length > 0 && (
          <ScrollReveal variant="fadeUp" delay={0.1} showLeafDecor>
            <GlassCard delay={0.4}>
              <div className="card-header">
                <h3 className="card-title">🔥 Your Habit Streaks</h3>
              </div>
              <div className="habit-streaks">
                {dashboardData.habitStreaks.map((streak, i) => (
                  <motion.div
                    key={streak.habitId}
                    className="streak-item"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + i * 0.05 }}
                  >
                    <div className="streak-icon">{getIconEmoji(streak.iconName)}</div>
                    <div className="streak-info">
                      <div className="streak-name">{streak.habitName}</div>
                      <div className="streak-category">{streak.category}</div>
                    </div>
                    <div className="streak-stats">
                      <div className="current-streak">
                        <span className="streak-fire">🔥</span> {streak.currentStreak} days
                      </div>
                      <div className="longest-streak">Best: {streak.longestStreak} days</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </GlassCard>
          </ScrollReveal>
        )}

        {/* Quick Actions */}
        <ScrollReveal variant="scaleUp" delay={0.1}>
          <GlassCard delay={0.5}>
            <div className="card-header">
              <h3 className="card-title">⚡ Quick Actions</h3>
            </div>
            <div className="quick-actions">
              <Link to="/log" className="btn btn-primary">✏️ Log Today's Habits</Link>
              <Link to="/habits" className="btn btn-outline">🌿 Browse Habits</Link>
              <Link to="/achievements" className="btn btn-outline">🏅 View Achievements</Link>
            </div>
          </GlassCard>
        </ScrollReveal>
      </div>
    </PageTransition>
  );
};

export default Dashboard;
