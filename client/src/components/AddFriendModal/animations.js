// Animation configurations for AddFriendModal

export const modalAnimations = {
  overlay: {
    fadeIn: {
      from: { opacity: 0 },
      to: { opacity: 1 },
      duration: '0.3s',
      easing: 'ease-out'
    }
  },
  modal: {
    scaleIn: {
      from: { 
        opacity: 0, 
        transform: 'scale(0.9)' 
      },
      to: { 
        opacity: 1, 
        transform: 'scale(1)' 
      },
      duration: '0.3s',
      easing: 'ease-out'
    }
  }
};

// Search button animations
export const searchButtonAnimations = {
  hover: {
    scale: 1.02,
    transition: { duration: 0.2 }
  },
  tap: {
    scale: 0.98
  },
  disabled: {
    opacity: 0.5,
    cursor: 'not-allowed'
  }
};

// Spinner animation
export const spinnerAnimation = {
  keyframes: {
    from: { transform: 'rotate(0deg)' },
    to: { transform: 'rotate(360deg)' }
  },
  duration: '1s',
  timing: 'linear',
  iteration: 'infinite'
};

// User card entrance animation
export const userCardEntrance = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  transition: { 
    duration: 0.3,
    ease: 'easeOut'
  }
};

// Empty state animation
export const emptyStateAnimation = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { 
    duration: 0.5,
    ease: 'easeOut'
  }
};

// Button hover effects
export const buttonHoverEffects = {
  messageBtn: {
    hover: {
      backgroundColor: 'rgba(154, 134, 243, 0.9)',
      scale: 1.05
    }
  },
  addBtn: {
    hover: {
      backgroundColor: '#1d4ed8',
      scale: 1.05
    }
  }
};

// Stagger children animation for results list
export const staggerResults = {
  container: {
    animate: {
      transition: {
        staggerChildren: 0.05
      }
    }
  },
  item: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 }
  }
};
