import { motion } from 'framer-motion';

function SidebarItem({
  icon: Icon,
  label,
  active,
  onClick
}) {

  return (

    <button

      onClick={onClick}

      className="
        relative
        flex w-full
        items-center
        gap-3
        overflow-hidden
        rounded-xl
        px-3 py-2.5
        text-sm
        font-medium
        transition-colors
        duration-200
      "
    >

      {/* ================================================= */}
      {/* ACTIVE CAPSULE */}
      {/* ================================================= */}

      {active && (

        <motion.div

          layoutId="active-sidebar-pill"

          transition={{
            type: 'tween',
            duration: 0.18,
            ease: 'easeOut'
          }}

          className="
            absolute inset-0
            rounded-xl
            bg-blue-500/15
            border border-blue-500/20
            shadow-sm
          "
        />

      )}


      {/* ================================================= */}
      {/* CONTENT */}
      {/* ================================================= */}

      <div
        className="
          relative z-10
          flex items-center
          gap-3
        "
      >

        <Icon
          className={[
            `
              h-4 w-4
              transition-colors
              duration-200
            `,
            active
              ? 'text-blue-400'
              : 'text-slate-400'
          ].join(' ')}
        />

        <span
          className={[
            `
              transition-colors
              duration-200
            `,
            active
              ? 'text-white'
              : 'text-slate-400'
          ].join(' ')}
        >
          {label}
        </span>

      </div>

    </button>
  );
}

export default SidebarItem;