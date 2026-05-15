export const pageTransition = {
  duration: 0.28,
  ease: 'easeOut'
};

export const fadeInUp = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0 }
};

export const staggerContainer = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.06
    }
  }
};
