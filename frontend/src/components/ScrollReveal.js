import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

/**
 * ScrollReveal component that wraps children with scroll-triggered animations.
 * Includes optional green/tree-themed decorative elements.
 */
const ScrollReveal = ({ 
  children, 
  variant = 'fadeUp', 
  delay = 0, 
  duration = 0.6, 
  className = '',
  showLeafDecor = false,
  threshold = 0.15 
}) => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold });

  const variants = {
    fadeUp: {
      hidden: { opacity: 0, y: 40 },
      visible: { opacity: 1, y: 0 }
    },
    fadeLeft: {
      hidden: { opacity: 0, x: -40 },
      visible: { opacity: 1, x: 0 }
    },
    fadeRight: {
      hidden: { opacity: 0, x: 40 },
      visible: { opacity: 1, x: 0 }
    },
    scaleUp: {
      hidden: { opacity: 0, scale: 0.85 },
      visible: { opacity: 1, scale: 1 }
    },
    growIn: {
      hidden: { opacity: 0, scale: 0.5, rotate: -10 },
      visible: { opacity: 1, scale: 1, rotate: 0 }
    },
    leafDrift: {
      hidden: { opacity: 0, y: 30, rotate: -15, x: -20 },
      visible: { opacity: 1, y: 0, rotate: 0, x: 0 }
    }
  };

  const chosen = variants[variant] || variants.fadeUp;

  return (
    <motion.div
      ref={ref}
      className={`scroll-reveal ${className}`}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={chosen}
      transition={{ 
        duration, 
        delay, 
        ease: [0.25, 0.46, 0.45, 0.94] 
      }}
      style={{ position: 'relative' }}
    >
      {showLeafDecor && inView && (
        <>
          <motion.span
            className="scroll-leaf-decor scroll-leaf-left"
            initial={{ opacity: 0, scale: 0, rotate: -45 }}
            animate={{ opacity: 0.15, scale: 1, rotate: 0 }}
            transition={{ delay: delay + 0.3, duration: 0.8 }}
            aria-hidden="true"
          >
            🌿
          </motion.span>
          <motion.span
            className="scroll-leaf-decor scroll-leaf-right"
            initial={{ opacity: 0, scale: 0, rotate: 45 }}
            animate={{ opacity: 0.12, scale: 1, rotate: 0 }}
            transition={{ delay: delay + 0.5, duration: 0.8 }}
            aria-hidden="true"
          >
            🍃
          </motion.span>
        </>
      )}
      {children}
    </motion.div>
  );
};

/**
 * ScrollRevealGroup: staggers children reveals.
 */
export const ScrollRevealGroup = ({ 
  children, 
  stagger = 0.08, 
  variant = 'fadeUp',
  className = '' 
}) => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <div ref={ref} className={className}>
      {React.Children.map(children, (child, i) =>
        child ? (
          <motion.div
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            variants={{
              hidden: { opacity: 0, y: variant === 'fadeUp' ? 30 : 0, x: variant === 'fadeLeft' ? -30 : 0 },
              visible: { opacity: 1, y: 0, x: 0 }
            }}
            transition={{
              duration: 0.5,
              delay: i * stagger,
              ease: [0.25, 0.46, 0.45, 0.94]
            }}
          >
            {child}
          </motion.div>
        ) : null
      )}
    </div>
  );
};

export default ScrollReveal;
