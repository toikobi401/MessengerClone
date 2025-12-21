// Helper function for date formatting
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Animation variants
export const badgeAnimation = {
  pulse: {
    duration: '2s',
    timing: 'cubic-bezier(0.4, 0, 0.6, 1)',
    iteration: 'infinite',
    keyframes: {
      '0%, 100%': { opacity: 1 },
      '50%': { opacity: 0.5 }
    }
  }
};

// Hover animations
export const hoverEffects = {
  container: {
    transition: 'box-shadow 0.2s ease',
    hover: {
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    }
  }
};
