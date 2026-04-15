import React from 'react';
import CountUp from 'react-countup';
import { useInView } from 'react-intersection-observer';
import { motion } from 'framer-motion';

const StatCard = ({ icon, value, label, delay = 0, gradient = 'var(--gradient-primary)' }) => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.3 });

  return (
    <motion.div
      ref={ref}
      className="stat-card-premium"
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay }}
    >
      <div className="stat-icon-wrap" style={{ background: gradient }}>
        <span className="stat-icon-emoji">{icon}</span>
      </div>
      <div className="stat-value-premium">
        {inView ? <CountUp end={value} duration={2} separator="," /> : 0}
      </div>
      <div className="stat-label-premium">{label}</div>
    </motion.div>
  );
};

export default StatCard;
