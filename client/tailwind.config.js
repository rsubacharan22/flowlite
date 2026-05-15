/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter var', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        soft: '0 18px 50px rgba(15, 23, 42, 0.08)',
        glow: '0 8px 32px rgba(37, 99, 235, 0.22)',
        'glow-sm': '0 4px 16px rgba(37, 99, 235, 0.15)',
        card: '0 1px 3px rgba(15,23,42,0.06), 0 4px 16px rgba(15,23,42,0.05)',
        'card-hover': '0 4px 6px rgba(15,23,42,0.07), 0 12px 36px rgba(15,23,42,0.09)'
      },
      ringWidth: {
        3: '3px'
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)'
      },
      letterSpacing: {
        tightest: '-0.03em'
      }
    }
  },
  plugins: []
};
