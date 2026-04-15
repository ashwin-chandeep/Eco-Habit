import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import PageTransition from '../components/PageTransition';
import SkeletonLoader from '../components/SkeletonLoader';
import ScrollReveal from '../components/ScrollReveal';

const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('points');
  const { user } = useAuth();

  useEffect(() => {
    fetchLeaderboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const fetchLeaderboardData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ metric: activeTab, limit: 100 });
      const res = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8080/api'}/leaderboard?${params.toString()}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('token') ? { Authorization: `Bearer ${localStorage.getItem('token')}` } : {})
        }
      });
      if (!res.ok) throw new Error('Failed to load leaderboard data');
      const data = await res.json();
      setLeaderboardData(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Failed to load leaderboard data');
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  const tabNames = { points: 'Total Points', streak: 'Current Streak', achievements: 'Achievements' };
  const getValueForTab = (d, tab) => {
    switch (tab) {
      case 'points': return `${d.points} pts`;
      case 'streak': return `${d.streak} days`;
      case 'achievements': return `${d.achievements} badges`;
      default: return '';
    }
  };

  const isCurrentUser = (d) => user && d.username === user.username;

  return (
    <PageTransition>
      <div className="container">
        <motion.div className="page-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="page-title">Leaderboard 🏆</h1>
          <p className="page-subtitle">See how you rank among the eco-conscious community</p>
        </motion.div>

        {/* Tabs */}
        <ScrollReveal variant="fadeUp" delay={0.05}>
        <motion.div className="card mb-3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="leaderboard-tabs">
            {['points', 'streak', 'achievements'].map(tab => (
              <motion.button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`tab-button ${activeTab === tab ? 'active' : ''}`}
                whileTap={{ scale: 0.95 }}
              >
                {tabNames[tab]}
              </motion.button>
            ))}
          </div>
        </motion.div>
        </ScrollReveal>

        {loading ? (
          <SkeletonLoader type="list" count={8} />
        ) : error ? (
          <div className="alert alert-error">{error}</div>
        ) : leaderboardData.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <div className="empty-state-icon">📊</div>
              <h3 className="empty-state-title">No leaderboard data yet</h3>
              <p className="empty-state-description">Start logging habits to appear on the leaderboard.</p>
            </div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              {/* Top 3 Podium */}
              {leaderboardData.length >= 3 && (
                <motion.div className="card mb-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
                  <div className="podium">
                    {[1, 0, 2].map(idx => {
                      const d = leaderboardData[idx];
                      const posClass = idx === 0 ? 'first' : idx === 1 ? 'second' : 'third';
                      return (
                        <motion.div
                          key={d.id}
                          className={`podium-position ${posClass}`}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 + idx * 0.1 }}
                        >
                          <div className="podium-rank">{getRankIcon(idx + 1)}</div>
                          <div className="podium-user">
                            <div className={`user-avatar ${idx === 0 ? 'champion' : ''}`}>
                              {d.firstName[0]}{d.lastName[0]}
                            </div>
                            <div className="user-name">{d.firstName} {d.lastName}</div>
                            <div className="user-username">@{d.username}</div>
                            <div className="user-score">{getValueForTab(d, activeTab)}</div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* Full List */}
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Rankings — {tabNames[activeTab]}</h3>
                </div>
                <div className="leaderboard-list">
                  {leaderboardData.map((userData, index) => {
                    const rank = index + 1;
                    const isCurrent = isCurrentUser(userData);
                    return (
                      <motion.div
                        key={userData.id}
                        className={`leaderboard-item ${isCurrent ? 'current-user' : ''}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                      >
                        <div className="rank">{getRankIcon(rank)}</div>
                        <div className="user-info">
                          <div className="user-avatar">{userData.firstName[0]}{userData.lastName[0]}</div>
                          <div className="user-details">
                            <div className="user-name">
                              {userData.firstName} {userData.lastName}
                              {isCurrent && <span className="you-badge">You</span>}
                            </div>
                            <div className="user-username">@{userData.username}</div>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div className="user-score-value">{getValueForTab(userData, activeTab)}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>
                            {activeTab !== 'points' && <span>{userData.points} pts</span>}
                            {activeTab !== 'streak' && activeTab !== 'points' && <span> · </span>}
                            {activeTab !== 'streak' && <span>{userData.streak}d streak</span>}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {user && !leaderboardData.some(d => isCurrentUser(d)) && (
                <motion.div className="card mt-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div style={{ textAlign: 'center', padding: '1.5rem' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🌱</div>
                    <p style={{ color: 'var(--text-secondary)' }}>Keep logging your habits to climb the leaderboard!</p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </PageTransition>
  );
};

export default Leaderboard;
