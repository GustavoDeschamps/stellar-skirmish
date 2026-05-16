/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        trade: { DEFAULT: '#3b82f6', light: '#93c5fd', dark: '#1d4ed8' },
        blob: { DEFAULT: '#22c55e', light: '#86efac', dark: '#15803d' },
        empire: { DEFAULT: '#eab308', light: '#fde047', dark: '#a16207' },
        cult: { DEFAULT: '#a855f7', light: '#d8b4fe', dark: '#7e22ce' },
        unaligned: { DEFAULT: '#6b7280', light: '#d1d5db', dark: '#374151' },
        surface: {
          DEFAULT: '#1a1a2e',
          light: '#16213e',
          card: '#0f3460',
          accent: '#e94560',
        },
      },
      animation: {
        'ally-glow': 'allyGlow 0.6s ease-in-out',
        'card-play': 'cardPlay 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        allyGlow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(255,255,255,0)' },
          '50%': { boxShadow: '0 0 12px 4px rgba(255,255,255,0.4)' },
        },
        cardPlay: {
          '0%': { transform: 'translateY(20px) scale(0.95)', opacity: '0' },
          '100%': { transform: 'translateY(0) scale(1)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
