// Animation configuration for Welcome component
export const welcomeAnimations = {
  fadeIn: {
    duration: '0.6s',
    easing: 'ease-out',
    keyframes: {
      from: {
        opacity: 0,
        transform: 'translateY(10px)'
      },
      to: {
        opacity: 1,
        transform: 'translateY(0)'
      }
    }
  }
};

// GSAP/Framer Motion variants can be added here
export const welcomeVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: 'easeOut' }
};
