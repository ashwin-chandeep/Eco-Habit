import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { habitsAPI, handleAPIError } from '../services/api';
import { getIconEmoji } from '../utils/iconMapping';
import PageTransition from '../components/PageTransition';
import SkeletonLoader from '../components/SkeletonLoader';
import ScrollReveal from '../components/ScrollReveal';

const Habits = () => {
  const [habits, setHabits] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchHabits();
    fetchCategories();
  }, []);

  const fetchHabits = async () => {
    try {
      setLoading(true);
      const data = await habitsAPI.getAll();
      setHabits(data);
    } catch (err) {
      setError(handleAPIError(err));
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await habitsAPI.getCategories();
      setCategories(data);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const handleCategoryChange = async (category) => {
    setSelectedCategory(category);
    setSearchQuery('');
    try {
      setLoading(true);
      const data = category === 'all' ? await habitsAPI.getAll() : await habitsAPI.getByCategory(category);
      setHabits(data);
    } catch (err) {
      setError(handleAPIError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    setSelectedCategory('all');
    if (!query.trim()) { fetchHabits(); return; }
    try {
      setLoading(true);
      const data = await habitsAPI.search(query);
      setHabits(data);
    } catch (err) {
      setError(handleAPIError(err));
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <PageTransition>
        <div className="container">
          <div className="alert alert-error">{error}</div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="container">
        <motion.div className="page-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="page-title">Eco Habits 🌿</h1>
          <p className="page-subtitle">Discover sustainable habits to build a better future</p>
        </motion.div>

        {/* Search & Filter */}
        <ScrollReveal variant="fadeUp" delay={0.05} showLeafDecor>
        <motion.div
          className="card mb-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="row">
            <div className="col-2">
              <div className="form-group">
                <label className="form-label">🔍 Search Habits</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Search by name or description..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="col-2">
              <div className="form-group">
                <label className="form-label">📁 Filter by Category</label>
                <select
                  className="form-input"
                  value={selectedCategory}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </motion.div>
        </ScrollReveal>

        {/* Habits Grid */}
        {loading ? (
          <SkeletonLoader type="card" count={6} />
        ) : habits.length > 0 ? (
          <div className="habit-grid">
            <AnimatePresence>
              {habits.map((habit, i) => (
                <motion.div
                  key={habit.id}
                  className="glass-card habit-card"
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: i * 0.04, duration: 0.3 }}
                  whileHover={{ y: -6, boxShadow: 'var(--shadow-glow)' }}
                >
                  <div className="habit-icon">{getIconEmoji(habit.iconName)}</div>
                  <h3 className="habit-name">{habit.name}</h3>
                  <p className="habit-description">{habit.description}</p>
                  <div className="habit-meta">
                    <span className="habit-category">{habit.category}</span>
                    <span className="habit-points">+{habit.impactPoints} pts</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <motion.div className="empty-state" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="empty-state-icon">🔍</div>
            <h3 className="empty-state-title">No Habits Found</h3>
            <p className="empty-state-description">
              {searchQuery ? `No habits match "${searchQuery}".` : selectedCategory !== 'all' ? `No habits in "${selectedCategory}".` : 'No habits available.'}
            </p>
            {(searchQuery || selectedCategory !== 'all') && (
              <button onClick={() => { setSearchQuery(''); setSelectedCategory('all'); fetchHabits(); }} className="btn btn-primary">
                Show All Habits
              </button>
            )}
          </motion.div>
        )}
      </div>
    </PageTransition>
  );
};

export default Habits;
