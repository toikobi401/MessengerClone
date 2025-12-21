// Badge pulse animation
export const badgePulseAnimation = {
  keyframes: {
    '0%, 100%': { opacity: 1 },
    '50%': { opacity: 0.5 }
  },
  duration: '2s',
  timing: 'cubic-bezier(0.4, 0, 0.6, 1)',
  iteration: 'infinite'
};

// Tab switch animation
export const tabSwitchAnimation = {
  active: {
    initial: { scale: 0.95, opacity: 0.8 },
    animate: { scale: 1, opacity: 1 },
    transition: {
      duration: 0.2,
      ease: 'easeOut'
    }
  }
};

// Dark mode toggle animation
export const darkModeToggleAnimation = {
  sun: {
    initial: { rotate: 0, scale: 0 },
    animate: { rotate: 180, scale: 1 },
    transition: {
      duration: 0.3,
      ease: 'easeInOut'
    }
  },
  moon: {
    initial: { rotate: 180, scale: 0 },
    animate: { rotate: 0, scale: 1 },
    transition: {
      duration: 0.3,
      ease: 'easeInOut'
    }
  }
};

// Button hover effects
export const buttonHoverEffects = {
  iconBtn: {
    hover: {
      scale: 1.1,
      transition: { duration: 0.2 }
    },
    tap: {
      scale: 0.95
    }
  },
  tab: {
    hover: {
      scale: 1.02,
      transition: { duration: 0.2 }
    },
    tap: {
      scale: 0.98
    }
  }
};

// Badge entrance animation
export const badgeEntranceAnimation = {
  initial: { scale: 0, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0, opacity: 0 },
  transition: {
    type: 'spring',
    stiffness: 500,
    damping: 25
  }
};

// Info box animation
export const infoBoxAnimation = {
  initial: { opacity: 0, y: -10 },
  animate: { opacity: 1, y: 0 },
  transition: {
    duration: 0.3,
    ease: 'easeOut'
  }
};

// Content fade animation
export const contentFadeAnimation = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: {
    duration: 0.2,
    ease: 'easeInOut'
  }
};

// Helper function for theme persistence
export const initializeTheme = () => {
  const savedTheme = localStorage.getItem('theme');
  const isDark = savedTheme === 'dark' || 
    (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
  
  if (isDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  
  return isDark;
};
