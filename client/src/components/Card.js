import { motion } from 'framer-motion';

import { fadeInUp } from '../utils/motion';

function Card({ children, className = '', delay = 0, hover = true }) {
  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="show"
      transition={{ duration: 0.35, delay, ease: 'easeOut' }}
      whileHover={hover ? { y: -3 } : undefined}
      className={[
        'surface rounded-2xl p-5 sm:p-6',
        hover ? 'transition-shadow hover:shadow-xl hover:shadow-slate-200/70' : '',
        className
      ].join(' ')}
    >
      {children}
    </motion.div>
  );
}

export default Card;
