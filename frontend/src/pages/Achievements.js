import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { achievementsAPI, handleAPIError } from '../services/api';
import { getIconEmoji } from '../utils/iconMapping';
import PageTransition from '../components/PageTransition';
import GlassCard from '../components/GlassCard';
import SkeletonLoader from '../components/SkeletonLoader';
import ScrollReveal from '../components/ScrollReveal';

const Achievements = () => {
  const [allAchievements, setAllAchievements] = useState([]);
  const [userAchievements, setUserAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        setLoading(true);
        const [allData, userData] = await Promise.all([
          achievementsAPI.getAll(),
          achievementsAPI.getUserAchievements()
        ]);
        setAllAchievements(allData);
        setUserAchievements(userData);
      } catch (err) {
        setError(handleAPIError(err));
      } finally {
        setLoading(false);
      }
    };
    fetchAchievements();
  }, []);

  const isAchievementEarned = (id) => userAchievements.some(ua => ua.achievement.id === id);
  const getEarnedDate = (id) => {
    const ua = userAchievements.find(ua => ua.achievement.id === id);
    return ua ? new Date(ua.earnedAt).toLocaleDateString() : null;
  };

  const groupByType = (achievements) =>
    achievements.reduce((groups, a) => {
      (groups[a.type] = groups[a.type] || []).push(a);
      return groups;
    }, {});

  const typeNames = { STREAK: 'Streak Achievements', TOTAL_HABITS: 'Habit Milestones', POINTS: 'Point Achievements' };
  const typeDescs = { STREAK: 'Maintain consistent habit streaks', TOTAL_HABITS: 'Complete a certain number of habits', POINTS: 'Earn points through habit completion' };

  if (loading) {
    return (
      <PageTransition>
        <div className="container">
          <div className="page-header"><div className="skeleton-line skeleton-title" style={{ width: '40%', margin: '0 auto' }} /></div>
          <SkeletonLoader type="card" count={6} />
        </div>
      </PageTransition>
    );
  }

  if (error) {
    return (<PageTransition><div className="container"><div className="alert alert-error">{error}</div></div></PageTransition>);
  }

  const groups = groupByType(allAchievements);
  const earnedCount = userAchievements.length;
  const totalCount = allAchievements.length;
  const pct = totalCount > 0 ? Math.round((earnedCount / totalCount) * 100) : 0;

  return (
    <PageTransition>
      <div className="container">
        <motion.div className="page-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="page-title">Achievements 🏆</h1>
          <p className="page-subtitle">Track your progress and unlock badges for your eco-friendly actions</p>
        </motion.div>

        {/* Progress */}
        <ScrollReveal variant="fadeUp" delay={0.05} showLeafDecor>
        <GlassCard delay={0.1} className="mb-4">
          <div className="achievement-progress">
            <div className="progress-info">
              <h3 style={{ color: 'var(--text-primary)' }}>Your Progress</h3>
              <p>{earnedCount} of {totalCount} achievements unlocked</p>
              <div className="progress-bar">
                <motion.div
                  className="progress-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ delay: 0.3, duration: 1, ease: 'easeOut' }}
                />
              </div>
              <div className="progress-percentage">{pct}% Complete</div>
            </div>
            <div className="progress-stats">
              <div className="stat">
                <div className="stat-number">{earnedCount}</div>
                <div className="stat-label">Earned</div>
              </div>
              <div className="stat">
                <div className="stat-number">{totalCount - earnedCount}</div>
                <div className="stat-label">Remaining</div>
              </div>
            </div>
          </div>
        </GlassCard>
        </ScrollReveal>

        {/* Groups */}
        {Object.entries(groups).map(([type, achievements]) => (
          <div key={type} className="achievement-section">
          <ScrollReveal variant="leafDrift" delay={0.05} key={type}>
            <motion.div className="section-header" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2>{typeNames[type] || type}</h2>
              <p style={{ color: 'var(--text-muted)' }}>{typeDescs[type] || ''}</p>
            </motion.div>
          </ScrollReveal>
            <div className="achievement-grid">
              {achievements.sort((a, b) => a.requiredValue - b.requiredValue).map((achievement, i) => {
                const isEarned = isAchievementEarned(achievement.id);
                const earnedDate = getEarnedDate(achievement.id);
                return (
                  <motion.div
                    key={achievement.id}
                    className={`glass-card achievement-card ${isEarned ? 'earned' : 'not-earned'}`}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={isEarned ? { scale: 1.03, boxShadow: 'var(--shadow-glow)' } : {}}
                  >
                    {isEarned && earnedDate && <div className="achievement-date">{earnedDate}</div>}
                    <div className="achievement-badge">{getIconEmoji(achievement.badgeIcon)}</div>
                    <h3 className="achievement-name">{achievement.name}</h3>
                    <p className="achievement-description">{achievement.description}</p>
                    <div className="achievement-requirement">
                      {type === 'STREAK' && `${achievement.requiredValue} day streak`}
                      {type === 'TOTAL_HABITS' && `${achievement.requiredValue} habits completed`}
                      {type === 'POINTS' && `${achievement.requiredValue} points earned`}
                    </div>
                    {achievement.pointsReward > 0 && (
                      <div className="achievement-reward">+{achievement.pointsReward} bonus pts</div>
                    )}
                    {isEarned && (
                      <div className="achievement-status">
                        <span className="earned-badge">✅ Unlocked</span>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}

        {allAchievements.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">🏆</div>
            <h3 className="empty-state-title">No Achievements Available</h3>
            <p className="empty-state-description">Achievements will appear here as they become available.</p>
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default Achievements;
