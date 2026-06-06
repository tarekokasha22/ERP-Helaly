/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        sidebar: {
          bg:          '#0f172a',
          hover:       '#1e293b',
          active:      '#1e293b',
          border:      '#1e293b',
          text:        '#94a3b8',
          'text-muted':'#475569',
          'text-active':'#f1f5f9',
        },
        surface: {
          50:  '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
        },
      },
      fontFamily: {
        sans:   ['Inter', 'Noto Sans Arabic', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        arabic: ['Noto Sans Arabic', 'Cairo', 'sans-serif'],
      },
      boxShadow: {
        'xs':          '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'card':        '0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
        'card-hover':  '0 8px 24px -4px rgb(0 0 0 / 0.12), 0 2px 8px -2px rgb(0 0 0 / 0.08)',
        'glow-brand':  '0 0 24px 0 rgb(249 115 22 / 0.25)',
        'glow-sm':     '0 0 12px 0 rgb(249 115 22 / 0.18)',
        'inner-light': 'inset 0 1px 0 rgb(255 255 255 / 0.06)',
        'sidebar':     '4px 0 24px 0 rgb(0 0 0 / 0.15)',
      },
      animation: {
        'fade-in':        'fadeIn 0.5s ease-out both',
        'fade-in-fast':   'fadeIn 0.25s ease-out both',
        'slide-up':       'slideUp 0.4s ease-out both',
        'slide-in-right': 'slideInRight 0.35s ease-out both',
        'slide-in-left':  'slideInLeft 0.35s ease-out both',
        'scale-in':       'scaleIn 0.3s cubic-bezier(0.175,0.885,0.32,1.275) both',
        'shimmer':        'shimmer 2s infinite',
        'pulse-brand':    'pulseBrand 2.5s cubic-bezier(0.4,0,0.6,1) infinite',
        'float':          'float 3s ease-in-out infinite',
        'count-up':       'countUp 0.8s ease-out both',
        'spin-slow':      'spin 3s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%':   { opacity: '0', transform: 'translateX(24px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInLeft: {
          '0%':   { opacity: '0', transform: 'translateX(-24px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%':   { opacity: '0', transform: 'scale(0.92)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        pulseBrand: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgb(249 115 22 / 0.4)' },
          '50%':       { boxShadow: '0 0 0 8px rgb(249 115 22 / 0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':       { transform: 'translateY(-6px)' },
        },
        countUp: {
          '0%':   { opacity: '0', transform: 'translateY(16px) scale(0.9)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
      },
      transitionTimingFunction: {
        spring:  'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        smooth:  'cubic-bezier(0.4, 0, 0.2, 1)',
        bounce:  'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'mesh-pattern': 'radial-gradient(circle at 25px 25px, rgba(249,115,22,0.05) 2px, transparent 0), radial-gradient(circle at 75px 75px, rgba(249,115,22,0.03) 2px, transparent 0)',
      },
      backgroundSize: {
        'mesh': '100px 100px',
      },
    },
  },
  plugins: [
    require('tailwindcss-rtl'),
  ],
}
