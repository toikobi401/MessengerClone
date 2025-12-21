// Animation configurations for Contacts component

export const contactItemAnimations = {
  hover: {
    transition: 'all 0.2s ease',
    scale: 1.02,
    backgroundColor: 'rgba(154, 134, 243, 0.1)'
  },
  active: {
    backgroundColor: 'rgba(154, 134, 243, 0.2)'
  }
};

export const onlineBadgeAnimation = {
  pulse: {
    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
    keyframes: {
      '0%, 100%': {
        opacity: 1
      },
      '50%': {
        opacity: 0.5
      }
    }
  }
};

// Scroll behavior
export const scrollConfig = {
  behavior: 'smooth',
  block: 'nearest'
};

// List item entrance animation
export const listItemEntrance = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.3 }
};
