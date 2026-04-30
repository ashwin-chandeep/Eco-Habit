import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

const AnimatedBackground = ({ variant = 'default' }) => {
  const blobs = variant === 'auth' ? [
    { color: 'var(--accent-cyan)', size: 400, x: '10%', y: '20%', duration: 20 },
    { color: 'var(--accent-purple)', size: 350, x: '70%', y: '60%', duration: 25 },
    { color: 'var(--accent-green)', size: 300, x: '50%', y: '10%', duration: 22 },
  ] : [
    { color: 'var(--accent-cyan)', size: 500, x: '80%', y: '10%', duration: 30 },
    { color: 'var(--accent-purple)', size: 400, x: '10%', y: '70%', duration: 35 },
    { color: '#10b981', size: 350, x: '50%', y: '40%', duration: 28 },
  ];

  // Generate floating leaf particles
  const leaves = useMemo(() => {
    const leafEmojis = ['🍃', '🌿', '🌱', '☘️', '🍀'];
    return Array.from({ length: 8 }, (_, i) => ({
      id: i,
      emoji: leafEmojis[i % leafEmojis.length],
      x: `${10 + Math.random() * 80}%`,
      size: 14 + Math.random() * 10,
      duration: 15 + Math.random() * 20,
      delay: Math.random() * 10,
      drift: -60 + Math.random() * 120,
    }));
  }, []);

  return (
    <div className="animated-bg">
      {blobs.map((blob, i) => (
        <motion.div
          key={i}
          className="bg-blob"
          style={{
            width: blob.size,
            height: blob.size,
            background: `radial-gradient(circle, ${blob.color}20 0%, transparent 70%)`,
            left: blob.x,
            top: blob.y,
          }}
          animate={{
            x: [0, 50, -30, 0],
            y: [0, -40, 30, 0],
            scale: [1, 1.1, 0.95, 1],
          }}
          transition={{
            duration: blob.duration,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
      {/* Floating leaf particles */}
      {leaves.map(leaf => (
        <motion.div
          key={`leaf-${leaf.id}`}
          style={{
            position: 'absolute',
            left: leaf.x,
            top: '-30px',
            fontSize: `${leaf.size}px`,
            pointerEvents: 'none',
            zIndex: 0,
          }}
          animate={{
            y: ['0vh', '105vh'],
            x: [0, leaf.drift, -leaf.drift / 2, leaf.drift / 3],
            rotate: [0, 180, 360],
            opacity: [0, 0.35, 0.35, 0],
          }}
          transition={{
            duration: leaf.duration,
            repeat: Infinity,
            delay: leaf.delay,
            ease: 'linear',
          }}
        >
          {leaf.emoji}
        </motion.div>
      ))}
      <div className="bg-grid" />
    </div>
  );
};

export default AnimatedBackground;
