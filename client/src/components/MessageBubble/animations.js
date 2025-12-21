// Helper function to format message timestamp
export const formatMessageTime = (dateString) => {
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Message bubble hover animation
export const messageBubbleHover = {
  hover: {
    scale: 1.01,
    transition: { duration: 0.2 }
  }
};

// Menu fade in animation
export const menuFadeIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
  transition: {
    duration: 0.15,
    ease: 'easeOut'
  }
};

// Edit mode entrance animation
export const editModeAnimation = {
  initial: { opacity: 0, height: 0 },
  animate: { opacity: 1, height: 'auto' },
  transition: {
    duration: 0.2,
    ease: 'easeOut'
  }
};

// Button hover effects
export const buttonHoverEffects = {
  menuTrigger: {
    hover: {
      backgroundColor: 'rgba(0, 0, 0, 0.1)',
      scale: 1.1
    }
  },
  saveBtn: {
    hover: {
      backgroundColor: '#059669',
      scale: 1.05
    }
  },
  cancelBtn: {
    hover: {
      backgroundColor: '#4b5563',
      scale: 1.05
    }
  }
};
