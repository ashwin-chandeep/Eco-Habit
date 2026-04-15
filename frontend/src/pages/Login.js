import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import AnimatedBackground from '../components/AnimatedBackground';
import PageTransition from '../components/PageTransition';

const Login = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [focused, setFocused] = useState({});
  const { login, error, clearError } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const result = await login(formData);
    if (result.success) {
      toast.success('Welcome back! 🌱');
      navigate(result.role === 'ROLE_ADMIN' ? '/admin' : '/dashboard');
    } else {
      toast.error(result.error || 'Login failed');
    }
    setIsLoading(false);
  };

  return (
    <PageTransition>
      <AnimatedBackground variant="auth" />
      <div className="auth-container">
        <motion.div
          className="auth-card"
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <div className="auth-header">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              style={{ fontSize: '3rem', marginBottom: '0.75rem' }}
            >
              🌱
            </motion.div>
            <h1 className="auth-title">Welcome Back</h1>
            <p className="auth-subtitle">Sign in to continue your eco journey</p>
          </div>

          {error && (
            <motion.div
              className="alert alert-error"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="username" className="form-label" style={focused.username ? { color: 'var(--accent-cyan)' } : {}}>
                Username
              </label>
              <motion.input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                onFocus={() => setFocused(p => ({ ...p, username: true }))}
                onBlur={() => setFocused(p => ({ ...p, username: false }))}
                className="form-input"
                placeholder="Enter your username"
                required
                disabled={isLoading}
                whileFocus={{ scale: 1.01 }}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label" style={focused.password ? { color: 'var(--accent-cyan)' } : {}}>
                Password
              </label>
              <motion.input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                onFocus={() => setFocused(p => ({ ...p, password: true }))}
                onBlur={() => setFocused(p => ({ ...p, password: false }))}
                className="form-input"
                placeholder="Enter your password"
                required
                disabled={isLoading}
                whileFocus={{ scale: 1.01 }}
              />
            </div>

            <motion.button
              type="submit"
              className="btn btn-primary btn-large"
              style={{ width: '100%' }}
              disabled={isLoading}
              whileTap={{ scale: 0.97 }}
              whileHover={{ scale: 1.02 }}
            >
              {isLoading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="spinner" style={{ width: 18, height: 18, margin: 0, borderWidth: 2 }} />
                  Signing In...
                </span>
              ) : 'Sign In →'}
            </motion.button>
          </form>

          <div className="auth-footer">
            <p>
              Don't have an account?{' '}
              <Link to="/register">Create one here</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default Login;
