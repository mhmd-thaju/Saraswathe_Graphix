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
          base:     '#0F1117',
          surface:  '#1A1D27',
          elevated: '#1E2330',
          border:   '#2A2D3E',
        },
        brand: {
          50:  '#EDE9FE',
          100: '#DDD6FE',
          400: '#A78BFA',
          500: '#8B5CF6',
          600: '#7C3AED',
          700: '#6D28D9',
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
          primary: '#F0F0F5',
          muted:   '#8892A4',
          faint:   '#4B5563',
        },
      },
      boxShadow: {
        glow:       '0 0 20px rgba(124, 58, 237, 0.25)',
        'glow-sm':  '0 0 10px rgba(124, 58, 237, 0.15)',
        card:       '0 4px 24px rgba(0,0,0,0.4)',
        'card-hover':'0 8px 32px rgba(0,0,0,0.5)',
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
