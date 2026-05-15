import { motion } from 'framer-motion';

function LoadingState({ label = 'Loading workspace' }) {
  return (
    <div className="flex min-h-80 items-center justify-center">
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-soft">
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="h-6 w-6 rounded-full border-2 border-slate-200 border-t-blue-600"
          />
        </div>
        <p className="mt-4 text-sm font-medium text-slate-500">{label}</p>
      </div>
    </div>
  );
}

export default LoadingState;
