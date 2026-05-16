/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        outfit: ['Outfit', 'sans-serif'],
        inter:  ['Inter',  'sans-serif'],
      },
      colors: {
        bg: {
          base:     'var(--bg-base)',
          surface:  'var(--bg-surface)',
          elevated: 'var(--bg-elevated)',
          border:   'var(--bg-border)',
        },
        brand: {
          50:  'var(--brand-50)',
          100: 'var(--brand-100)',
          400: 'var(--brand-400)',
          500: 'var(--brand-500)',
          600: 'var(--brand-600)',
          700: 'var(--brand-700)',
        },
        warm: {
          400: '#FB923C',
          500: '#F97316',
          600: '#EA580C',
        },
        success: '#22C55E',
        warning: '#EAB308',
        danger:  '#EF4444',
        info:    '#3B82F6',
        text: {
          primary: 'var(--text-primary)',
          muted:   'var(--text-muted)',
          faint:   'var(--text-faint)',
        },
      },
      boxShadow: {
        glow:       '0 0 20px rgba(124, 58, 237, 0.25)',
        'glow-sm':  '0 0 10px rgba(124, 58, 237, 0.15)',
        card:       '0 4px 24px var(--shadow-color)',
        'card-hover':'0 8px 32px var(--shadow-color)',
      },
      backdropBlur: {
        xs: '4px',
      },
      animation: {
        'fade-in':     'fadeIn 0.2s ease-out',
        'slide-up':    'slideUp 0.25s ease-out',
        'slide-right': 'slideRight 0.25s ease-out',
        'pulse-soft':  'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:    { from: { opacity: '0' },                 to: { opacity: '1' } },
        slideUp:   { from: { opacity: '0', transform: 'translateY(12px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideRight:{ from: { opacity: '0', transform: 'translateX(-12px)' }, to: { opacity: '1', transform: 'translateX(0)' } },
        pulseSoft: { '0%,100%': { opacity: '1' }, '50%': { opacity: '0.6' } },
      },
    },
  },
  plugins: [],
}
