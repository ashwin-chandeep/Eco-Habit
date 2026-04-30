import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { dashboardAPI, handleAPIError } from '../services/api';
import PageTransition from '../components/PageTransition';
import GlassCard from '../components/GlassCard';
import ScrollReveal from '../components/ScrollReveal';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({
    totalPoints: 0,
    currentStreak: 0,
    longestStreak: 0,
    totalHabits: 0,
    achievements: 0,
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await dashboardAPI.getUserDashboard();
        setStats({
          totalPoints: data?.totalPoints || 0,
          currentStreak: data?.currentStreak || 0,
          longestStreak: data?.longestStreak || 0,
          totalHabits: data?.totalHabitsCompleted || 0,
          achievements: data?.achievementsCount || 0,
        });
      } catch (err) {
        toast.error(handleAPIError(err));
      }
    };
    loadStats();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch {
      toast.error('Failed to update profile.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
    });
    setIsEditing(false);
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      toast.error('Account deletion is not yet implemented.');
    }
  };

  const statItems = [
    { icon: '🏆', value: stats.totalPoints, label: 'Total Points' },
    { icon: '🔥', value: stats.currentStreak, label: 'Current Streak' },
    { icon: '📈', value: stats.longestStreak, label: 'Longest Streak' },
    { icon: '✅', value: stats.totalHabits, label: 'Habits Completed' },
    { icon: '🎖️', value: stats.achievements, label: 'Achievements' },
  ];

  return (
    <PageTransition>
      <div className="container">
        <motion.div className="page-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="page-title">Profile</h1>
          <p className="page-subtitle">Manage your account settings and view your progress</p>
        </motion.div>

        <div className="row">
          {/* Profile Card */}
          <div className="col-2">
            <ScrollReveal variant="fadeLeft" delay={0.05} showLeafDecor>
            {/* Avatar Header */}
            <GlassCard delay={0.05}>
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <motion.div
                  className="user-avatar champion"
                  style={{ width: 80, height: 80, fontSize: '1.75rem', margin: '0 auto 1rem' }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                >
                  {(user?.firstName?.[0] || '')}{(user?.lastName?.[0] || '')}
                </motion.div>
                <h3 style={{ color: 'var(--text-primary)', margin: 0 }}>
                  {user?.firstName} {user?.lastName}
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>@{user?.username}</p>
              </div>
            </GlassCard>

            {/* Profile Info */}
            <GlassCard delay={0.1}>
              <div className="card-header">
                <h3 className="card-title">Profile Information</h3>
                {!isEditing && (
                  <motion.button onClick={() => setIsEditing(true)} className="btn btn-outline btn-small" whileTap={{ scale: 0.95 }}>
                    Edit
                  </motion.button>
                )}
              </div>

              {isEditing ? (
                <motion.form onSubmit={handleSubmit} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  {[
                    { name: 'firstName', label: 'First Name', type: 'text' },
                    { name: 'lastName', label: 'Last Name', type: 'text' },
                    { name: 'email', label: 'Email', type: 'email' },
                  ].map(field => (
                    <div className="form-group" key={field.name}>
                      <label className="form-label">{field.label}</label>
                      <input
                        type={field.type}
                        name={field.name}
                        value={formData[field.name]}
                        onChange={handleChange}
                        className="form-input"
                        disabled={isLoading}
                      />
                    </div>
                  ))}
                  <div className="form-actions">
                    <button type="submit" className="btn btn-primary" disabled={isLoading}>
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button type="button" onClick={handleCancel} className="btn btn-outline" disabled={isLoading}>
                      Cancel
                    </button>
                  </div>
                </motion.form>
              ) : (
                <div className="profile-display">
                  {[
                    { label: 'Username', value: `@${user?.username}` },
                    { label: 'Name', value: formData.firstName || formData.lastName ? `${formData.firstName} ${formData.lastName}`.trim() : 'Not set' },
                    { label: 'Email', value: formData.email },
                  ].map((field, i) => (
                    <motion.div className="profile-field" key={field.label} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                      <label>{field.label}</label>
                      <div className="field-value">{field.value}</div>
                    </motion.div>
                  ))}
                </div>
              )}
            </GlassCard>
            </ScrollReveal>
          </div>

          {/* Stats & Actions */}
          <div className="col-2">
            <ScrollReveal variant="fadeRight" delay={0.1} showLeafDecor>
            <GlassCard delay={0.15}>
              <div className="card-header">
                <h3 className="card-title">Your Statistics</h3>
              </div>
              <div className="stats-grid">
                {statItems.map((s, i) => (
                  <motion.div className="stat-item" key={s.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.06 }}>
                    <div className="stat-icon">{s.icon}</div>
                    <div className="stat-info">
                      <div className="stat-number">{s.value}</div>
                      <div className="stat-label">{s.label}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </GlassCard>

            <GlassCard delay={0.25}>
              <div className="card-header">
                <h3 className="card-title">Account Actions</h3>
              </div>
              <div className="account-actions">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="btn btn-secondary"
                  style={{ width: '100%', marginBottom: '1rem' }}
                  aria-label="Log out of your account"
                >
                  🚪 Log Out
                </button>
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  className="btn"
                  style={{ width: '100%', backgroundColor: 'var(--accent-red)', color: 'white' }}
                  aria-label="Delete your account"
                >
                  🗑️ Delete Account
                </button>
              </div>
            </GlassCard>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Profile;
