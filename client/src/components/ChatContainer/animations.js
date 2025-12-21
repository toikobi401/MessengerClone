// Helper function to format message timestamp
export const formatMessageTime = (dateString) => {
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Message entrance animation
export const messageEntranceAnimation = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: {
    duration: 0.3,
    ease: 'easeOut'
  }
};

// Sent message animation (from right)
export const sentMessageAnimation = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  transition: {
    duration: 0.3,
    ease: 'easeOut'
  }
};

// Received message animation (from left)
export const receivedMessageAnimation = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  transition: {
    duration: 0.3,
    ease: 'easeOut'
  }
};

// Auto scroll animation
export const autoScrollConfig = {
  behavior: 'smooth',
  block: 'end',
  inline: 'nearest'
};

// Emoji picker toggle animation
export const emojiPickerAnimation = {
  initial: { opacity: 0, scale: 0.9, y: 10 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.9, y: 10 },
  transition: {
    duration: 0.2,
    ease: 'easeOut'
  }
};

// Send button animation
export const sendButtonAnimation = {
  hover: {
    scale: 1.05,
    backgroundColor: '#4e0eff'
  },
  tap: {
    scale: 0.95
  },
  disabled: {
    opacity: 0.5,
    cursor: 'not-allowed'
  }
};

// Emoji button hover
export const emojiButtonHover = {
  hover: {
    backgroundColor: 'rgba(154, 134, 243, 0.2)',
    transition: { duration: 0.2 }
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

// Online badge pulse
export const onlineBadgePulse = {
  keyframes: {
    '0%, 100%': { opacity: 1, scale: 1 },
    '50%': { opacity: 0.7, scale: 0.95 }
  },
  duration: '2s',
  timing: 'ease-in-out',
  iteration: 'infinite'
};

// Message list stagger animation
export const messageListStagger = {
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

// Typing indicator animation
export const typingIndicatorAnimation = {
  dot: {
    keyframes: {
      '0%, 60%, 100%': { transform: 'translateY(0)' },
      '30%': { transform: 'translateY(-10px)' }
    },
    duration: '1.4s',
    timing: 'ease-in-out',
    iteration: 'infinite'
  }
};

// Input focus animation
export const inputFocusAnimation = {
  focus: {
    borderColor: '#9a86f3',
    boxShadow: '0 0 0 2px rgba(154, 134, 243, 0.3)'
  }
};
