// Animation configurations for ContactsList

export const listItemAnimations = {
  hover: {
    transition: 'all 0.2s ease',
    transform: 'scale(1.02)'
  },
  active: {
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    backgroundColor: '#9a86f3'
  }
};

export const onlineBadgePulse = {
  animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  keyframes: {
    '0%, 100%': {
      opacity: 1
    },
    '50%': {
      opacity: 0.7
    }
  }
};

// Entrance animations for list items
export const contactItemEntrance = {
  initial: { opacity: 0, x: -10 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.2 }
};

// Empty state fade in
export const emptyStateFade = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 }
};
