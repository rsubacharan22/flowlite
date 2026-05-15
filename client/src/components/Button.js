import { motion } from 'framer-motion';

const variants = {
  primary: 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-glow hover:shadow-blue-500/30',
  secondary: 'border border-slate-200 bg-white text-slate-700 shadow-sm hover:border-blue-200 hover:bg-blue-50/40 hover:text-blue-700',
  danger: 'bg-gradient-to-r from-rose-600 to-pink-500 text-white shadow-lg shadow-rose-500/20 hover:shadow-rose-500/30',
  ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
};

function Button({
  children,
  className = '',
  danger = false,
  disabled = false,
  icon: Icon,
  type = 'button',
  variant = 'primary',
  ...props
}) {
  const resolvedVariant = danger ? 'danger' : variant;

  return (
    <motion.button
      type={type}
      whileHover={disabled ? undefined : { y: -1 }}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      className={[
        'inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60',
        variants[resolvedVariant],
        className
      ].join(' ')}
      disabled={disabled}
      {...props}
    >
      {Icon && <Icon className="h-4 w-4" />}
      {children}
    </motion.button>
  );
}

export default Button;
