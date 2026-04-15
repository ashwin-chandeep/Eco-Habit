import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import AnimatedBackground from '../components/AnimatedBackground';
import PageTransition from '../components/PageTransition';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '', email: '', password: '', confirmPassword: '', firstName: '', lastName: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [focused, setFocused] = useState({});
  const { register, error, clearError } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (validationErrors[name]) setValidationErrors(prev => ({ ...prev, [name]: '' }));
    if (error) clearError();
  };

  const validateForm = () => {
    const errors = {};
    if (formData.username.length < 3) errors.username = 'Username must be at least 3 characters';
    if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Please enter a valid email';
    if (formData.password.length < 6) errors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) errors.confirmPassword = 'Passwords do not match';
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    const { confirmPassword, ...registrationData } = formData;
    const result = await register(registrationData);
    if (result.success) {
      toast.success('Account created! Please sign in 🎉');
      navigate('/login', { state: { message: 'Registration successful!' } });
    } else {
      toast.error(result.error || 'Registration failed');
    }
    setIsLoading(false);
  };

  const inputProps = (name, label, type = 'text', required = false) => ({
    type,
    id: name,
    name,
    value: formData[name],
    onChange: handleChange,
    onFocus: () => setFocused(p => ({ ...p, [name]: true })),
    onBlur: () => setFocused(p => ({ ...p, [name]: false })),
    className: `form-input ${validationErrors[name] ? 'error' : ''}`,
    required,
    disabled: isLoading,
    placeholder: `Enter ${label.toLowerCase()}`,
  });

  return (
    <PageTransition>
      <AnimatedBackground variant="auth" />
      <div className="auth-container">
        <motion.div
          className="auth-card"
          style={{ maxWidth: 500 }}
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
              🌍
            </motion.div>
            <h1 className="auth-title">Join EcoHabit</h1>
            <p className="auth-subtitle">Start building sustainable habits today</p>
          </div>

          {error && (
            <motion.div className="alert alert-error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="row">
              <div className="col-2">
                <div className="form-group">
                  <label htmlFor="firstName" className="form-label" style={focused.firstName ? { color: 'var(--accent-cyan)' } : {}}>
                    First Name
                  </label>
                  <input {...inputProps('firstName', 'First name')} />
                </div>
              </div>
              <div className="col-2">
                <div className="form-group">
                  <label htmlFor="lastName" className="form-label" style={focused.lastName ? { color: 'var(--accent-cyan)' } : {}}>
                    Last Name
                  </label>
                  <input {...inputProps('lastName', 'Last name')} />
                </div>
              </div>
            </div>

            {[
              { name: 'username', label: 'Username *', required: true },
              { name: 'email', label: 'Email *', type: 'email', required: true },
              { name: 'password', label: 'Password *', type: 'password', required: true },
              { name: 'confirmPassword', label: 'Confirm Password *', type: 'password', required: true },
            ].map(({ name, label, type, required }) => (
              <div className="form-group" key={name}>
                <label htmlFor={name} className="form-label" style={focused[name] ? { color: 'var(--accent-cyan)' } : {}}>
                  {label}
                </label>
                <input {...inputProps(name, label.replace(' *', ''), type, required)} />
                {validationErrors[name] && (
                  <motion.div className="form-error" initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}>
                    {validationErrors[name]}
                  </motion.div>
                )}
              </div>
            ))}

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
                  Creating Account...
                </span>
              ) : 'Create Account →'}
            </motion.button>
          </form>

          <div className="auth-footer">
            <p>
              Already have an account?{' '}
              <Link to="/login">Sign in here</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default Register;
