import React from 'react';
import { motion } from 'framer-motion';

const GlassCard = ({ children, className = '', hover = true, glow = false, delay = 0, ...props }) => (
  <motion.div
    className={`glass-card ${glow ? 'glow-border' : ''} ${className}`}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
    whileHover={hover ? { y: -4, transition: { duration: 0.2 } } : undefined}
    {...props}
  >
    {children}
  </motion.div>
);

export default GlassCard;
