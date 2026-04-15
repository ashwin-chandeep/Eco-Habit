import React from 'react';

const SkeletonLoader = ({ type = 'card', count = 1 }) => {
  const items = Array.from({ length: count }, (_, i) => i);

  if (type === 'card') {
    return (
      <div className="skeleton-grid">
        {items.map(i => (
          <div key={i} className="skeleton-card">
            <div className="skeleton-line skeleton-title" />
            <div className="skeleton-line skeleton-text" />
            <div className="skeleton-line skeleton-text short" />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'stats') {
    return (
      <div className="skeleton-stats">
        {items.map(i => (
          <div key={i} className="skeleton-card skeleton-stat">
            <div className="skeleton-circle" />
            <div className="skeleton-line skeleton-title" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="skeleton-list">
      {items.map(i => (
        <div key={i} className="skeleton-card skeleton-row">
          <div className="skeleton-circle small" />
          <div style={{ flex: 1 }}>
            <div className="skeleton-line skeleton-text" />
            <div className="skeleton-line skeleton-text short" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default SkeletonLoader;
