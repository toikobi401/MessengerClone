// Debounce helper function
let debounceTimer;
export const debounceSearch = (callback, delay) => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(callback, delay);
};

// Dropdown animations
export const dropdownAnimations = {
  initial: { opacity: 0, y: -10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: {
    duration: 0.2,
    ease: 'easeOut'
  }
};

// Result item entrance animation
export const resultItemAnimation = {
  initial: { opacity: 0, x: -10 },
  animate: { opacity: 1, x: 0 },
  transition: {
    duration: 0.2,
    ease: 'easeOut'
  }
};

// Stagger results animation
export const staggerResults = {
  container: {
    animate: {
      transition: {
        staggerChildren: 0.05
      }
    }
  },
  item: {
    initial: { opacity: 0, x: -10 },
    animate: { opacity: 1, x: 0 }
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

// Button hover effects
export const buttonHoverEffects = {
  messageBtn: {
    hover: {
      backgroundColor: 'rgba(34, 197, 94, 0.3)',
      scale: 1.05
    }
  },
  addBtn: {
    hover: {
      backgroundColor: 'rgba(154, 134, 243, 0.9)',
      scale: 1.05
    }
  }
};

// Clear button animation
export const clearButtonAnimation = {
  initial: { scale: 0, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0, opacity: 0 },
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
    duration: 0.3,
    ease: 'easeOut'
  }
};
