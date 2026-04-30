import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const isActive = (path) => location.pathname === path ? 'active' : '';

  const handleLogout = useCallback(() => {
    setMobileOpen(false);
    logout();
    navigate('/login');
  }, [logout, navigate]);

  const toggleMenu = useCallback(() => {
    setMobileOpen(prev => !prev);
  }, []);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  const navLinks = user ? (
    user.role === 'ROLE_ADMIN' ? [
      { to: '/admin', label: 'Admin', icon: '⚡' },
      { to: '/habits', label: 'Habits', icon: '🌿' },
      { to: '/leaderboard', label: 'Board', icon: '🏆' },
      { to: '/profile', label: 'Profile', icon: '👤' },
    ] : [
      { to: '/dashboard', label: 'Home', icon: '📊' },
      { to: '/habits', label: 'Habits', icon: '🌿' },
      { to: '/log', label: 'Log', icon: '✏️' },
      { to: '/achievements', label: 'Awards', icon: '🏅' },
      { to: '/leaderboard', label: 'Board', icon: '🏆' },
      { to: '/profile', label: 'Profile', icon: '👤' },
    ]
  ) : [
    { to: '/login', label: 'Login', icon: '🔑' },
    { to: '/register', label: 'Register', icon: '📝' },
  ];

  // Bottom navigation links (subset for mobile bottom bar)
  const bottomNavLinks = user ? (
    user.role === 'ROLE_ADMIN' ? [
      { to: '/admin', label: 'Admin', icon: '⚡' },
      { to: '/habits', label: 'Habits', icon: '🌿' },
      { to: '/leaderboard', label: 'Board', icon: '🏆' },
      { to: '/profile', label: 'Profile', icon: '👤' },
    ] : [
      { to: '/dashboard', label: 'Home', icon: '📊' },
      { to: '/habits', label: 'Habits', icon: '🌿' },
      { to: '/log', label: 'Log', icon: '✏️' },
      { to: '/achievements', label: 'Awards', icon: '🏅' },
      { to: '/profile', label: 'Me', icon: '👤' },
    ]
  ) : [];

  return (
    <>
      {/* Top Navbar */}
      <nav
        className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}
        style={scrolled ? { boxShadow: 'var(--shadow-md)' } : {}}
      >
        <div className="container">
          <div className="navbar-content">
            <Link to="/" className="navbar-brand">
              🌱 EcoHabit
            </Link>

            <div className="navbar-right">
              {/* Desktop Nav */}
              <ul className="navbar-nav desktop-nav">
                {navLinks.map(link => (
                  <li key={link.to}>
                    <Link to={link.to} className={isActive(link.to)}>
                      <span className="nav-icon">{link.icon}</span>
                      <span className="nav-label">{link.label}</span>
                    </Link>
                  </li>
                ))}
                {user && (
                  <li>
                    <button onClick={handleLogout} className="btn btn-outline btn-small" type="button">
                      Logout
                    </button>
                  </li>
                )}
              </ul>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="theme-toggle"
                aria-label="Toggle theme"
                title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                type="button"
              >
                {isDark ? '☀️' : '🌙'}
              </button>

              {/* Hamburger Menu Button */}
              <button
                className={`hamburger ${mobileOpen ? 'open' : ''}`}
                onClick={toggleMenu}
                aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
                aria-expanded={mobileOpen}
                type="button"
              >
                <span></span>
                <span></span>
                <span></span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile/Tablet Slide-over Nav — OUTSIDE the navbar to avoid stacking/overflow issues */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-overlay"
            className="mobile-nav-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeMobile}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-drawer"
            className="mobile-nav-drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            <div className="mobile-nav-header">
              <span className="mobile-nav-brand">🌱 EcoHabit</span>
              <button
                className="mobile-nav-close"
                onClick={closeMobile}
                aria-label="Close menu"
                type="button"
              >
                ✕
              </button>
            </div>
            <ul className="mobile-nav-links">
              {navLinks.map((link, i) => (
                <motion.li
                  key={link.to}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 + 0.1 }}
                >
                  <Link
                    to={link.to}
                    className={`mobile-nav-link ${isActive(link.to)}`}
                    onClick={closeMobile}
                  >
                    <span className="mobile-nav-icon">{link.icon}</span>
                    <span>{link.label}</span>
                  </Link>
                </motion.li>
              ))}
              {user && (
                <motion.li
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: navLinks.length * 0.05 + 0.1 }}
                >
                  <button
                    onClick={handleLogout}
                    className="btn btn-outline mobile-nav-logout"
                    type="button"
                  >
                    🚪 Logout
                  </button>
                </motion.li>
              )}
            </ul>
            {/* Decorative leaf */}
            <div className="mobile-nav-decor" aria-hidden="true">
              <span>🌿</span>
              <span>🍃</span>
              <span>🌱</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Navigation for phones */}
      {bottomNavLinks.length > 0 && (
        <nav className="bottom-nav" aria-label="Mobile navigation">
          {bottomNavLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`bottom-nav-item ${isActive(link.to)}`}
            >
              <span className="bottom-nav-icon">{link.icon}</span>
              <span className="bottom-nav-label">{link.label}</span>
            </Link>
          ))}
        </nav>
      )}
    </>
  );
};

export default Navbar;
