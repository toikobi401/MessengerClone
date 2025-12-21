// Animation configurations for FriendRequestList modal

export const modalAnimations = {
  overlay: {
    fadeIn: {
      from: { opacity: 0 },
      to: { opacity: 1 },
      duration: '0.2s',
      easing: 'ease-out'
    }
  },
  modal: {
    slideUp: {
      from: { 
        opacity: 0, 
        transform: 'translateY(20px) scale(0.95)' 
      },
      to: { 
        opacity: 1, 
        transform: 'translateY(0) scale(1)' 
      },
      duration: '0.3s',
      easing: 'ease-out'
    }
  }
};

// Loading spinner animation
export const spinnerAnimation = {
  keyframes: {
    from: { transform: 'rotate(0deg)' },
    to: { transform: 'rotate(360deg)' }
  },
  duration: '1s',
  timing: 'linear',
  iteration: 'infinite'
};

// Request item entrance animation
export const requestItemEntrance = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { 
    duration: 0.2,
    ease: 'easeOut'
  }
};

// Empty state animation
export const emptyStateAnimation = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  transition: { 
    duration: 0.4,
    ease: 'easeOut'
  }
};

// Close button hover effect
export const closeBtnHover = {
  scale: 1.1,
  transition: { duration: 0.2 }
};
