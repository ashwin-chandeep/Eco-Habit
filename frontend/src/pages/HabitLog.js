import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { habitsAPI, habitLogsAPI, handleAPIError } from '../services/api';
import { getIconEmoji } from '../utils/iconMapping';
import PageTransition from '../components/PageTransition';
import GlassCard from '../components/GlassCard';
import SkeletonLoader from '../components/SkeletonLoader';
import ScrollReveal from '../components/ScrollReveal';

const HabitLog = () => {
  const [habits, setHabits] = useState([]);
  const [todayLogs, setTodayLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [notesByHabit, setNotesByHabit] = useState({});

  useEffect(() => {
    fetchHabits();
    fetchTodayLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  const fetchHabits = async () => {
    try {
      const data = await habitsAPI.getAll();
      setHabits(data);
    } catch (err) {
      setError(handleAPIError(err));
    }
  };

  const fetchTodayLogs = async () => {
    try {
      setLoading(true);
      const data = await habitLogsAPI.getLogsForDate(selectedDate);
      setTodayLogs(data);
    } catch (err) {
      setError(handleAPIError(err));
    } finally {
      setLoading(false);
    }
  };

  const isHabitLoggedToday = (habitId) => todayLogs.some(log => log.habit.id === habitId && log.completed);
  const getHabitLog = (habitId) => todayLogs.find(log => log.habit.id === habitId);

  const handleLogHabit = async (habitId, completed = true, notes = '') => {
    try {
      setSubmitting(true);
      setError(null);
      await habitLogsAPI.create({ habitId, logDate: selectedDate, completed, notes });
      await fetchTodayLogs();
      if (completed) toast.success('Habit completed! 🎉');
      else toast('Habit unchecked', { icon: '↩️' });
    } catch (err) {
      toast.error(handleAPIError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleNotesChange = (habitId, notes) => {
    setNotesByHabit(prev => ({ ...prev, [habitId]: notes }));
    const existingLog = getHabitLog(habitId);
    if (existingLog) handleLogHabit(habitId, existingLog.completed, notes);
  };

  const isToday = selectedDate === new Date().toISOString().split('T')[0];
  const formattedDate = new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <PageTransition>
      <div className="container">
        <motion.div className="page-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="page-title">Log Your Habits ✏️</h1>
          <p className="page-subtitle">Track your daily eco-conscious activities</p>
        </motion.div>

        {/* Date Selector */}
        <ScrollReveal variant="fadeUp" delay={0.05} showLeafDecor>
        <GlassCard delay={0.1} className="mb-3">
          <div className="row align-center">
            <div className="col">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">📅 Select Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
            <div className="col">
              <div className="date-info">
                <h3 style={{ color: 'var(--text-primary)' }}>{formattedDate}</h3>
                <p style={{ color: 'var(--text-muted)', margin: 0 }}>{isToday ? '📍 Today' : '📆 Past date'}</p>
              </div>
            </div>
          </div>
        </GlassCard>
        </ScrollReveal>

        {error && <div className="alert alert-error">{error}</div>}

        {/* Habits List */}
        {loading ? (
          <SkeletonLoader type="list" count={5} />
        ) : habits.length > 0 ? (
          <div className="habits-log-list">
            {habits.map((habit, i) => {
              const isLogged = isHabitLoggedToday(habit.id);
              const existingLog = getHabitLog(habit.id);
              return (
                <motion.div
                  key={habit.id}
                  className={`card habit-log-card ${isLogged ? 'completed' : ''}`}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <div className="habit-log-header">
                    <div className="habit-info">
                      <div className="habit-icon">{getIconEmoji(habit.iconName)}</div>
                      <div style={{ minWidth: 0 }}>
                        <h3 className="habit-name">{habit.name}</h3>
                        <p className="habit-description">{habit.description}</p>
                        <div className="habit-meta">
                          <span className="habit-category">{habit.category}</span>
                          <span className="habit-points">+{habit.impactPoints} pts</span>
                        </div>
                      </div>
                    </div>
                    <div className="habit-actions">
                      {isLogged ? (
                        <motion.div
                          className="completed-indicator"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 300 }}
                        >
                          <span className="completed-icon">✅</span>
                          <span>Done!</span>
                        </motion.div>
                      ) : (
                        <motion.button
                          onClick={() => handleLogHabit(habit.id, true, notesByHabit[habit.id] || '')}
                          disabled={submitting}
                          className="btn btn-primary"
                          whileTap={{ scale: 0.95 }}
                          whileHover={{ scale: 1.03 }}
                        >
                          {submitting ? 'Logging...' : '✓ Complete'}
                        </motion.button>
                      )}
                    </div>
                  </div>
                  <div className="habit-notes">
                    <label className="form-label">Notes (optional)</label>
                    <textarea
                      className="form-input"
                      placeholder="Add notes about this habit..."
                      value={existingLog?.notes ?? notesByHabit[habit.id] ?? ''}
                      onChange={(e) => handleNotesChange(habit.id, e.target.value)}
                      rows="2"
                    />
                  </div>
                  {isLogged && (
                    <div className="habit-undo">
                      <button
                        onClick={() => handleLogHabit(habit.id, false)}
                        disabled={submitting}
                        className="btn btn-outline btn-small"
                      >
                        ↩️ Undo
                      </button>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">📝</div>
            <h3 className="empty-state-title">No Habits Available</h3>
            <p className="empty-state-description">There are no habits to log at the moment.</p>
          </div>
        )}

        {/* Summary */}
        {habits.length > 0 && (
          <ScrollReveal variant="scaleUp" delay={0.1} showLeafDecor>
          <GlassCard delay={0.3} className="mt-3">
            <div className="card-header">
              <h3 className="card-title">📊 Daily Summary</h3>
            </div>
            <div className="daily-summary">
              <div className="summary-stat">
                <div className="summary-number">{todayLogs.filter(l => l.completed).length}</div>
                <div className="summary-label">Completed</div>
              </div>
              <div className="summary-stat">
                <div className="summary-number">{habits.length}</div>
                <div className="summary-label">Total Habits</div>
              </div>
              <div className="summary-stat">
                <div className="summary-number">
                  {todayLogs.reduce((t, l) => t + (l.completed ? l.pointsEarned || 0 : 0), 0)}
                </div>
                <div className="summary-label">Points Earned</div>
              </div>
            </div>
          </GlassCard>
          </ScrollReveal>
        )}
      </div>
    </PageTransition>
  );
};

export default HabitLog;
