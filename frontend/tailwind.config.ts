import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // Do'kon brend ranglari
        brand: {
          50: '#fff5f7',
          100: '#ffe3e9',
          200: '#ffc7d4',
          300: '#ff9db4',
          400: '#fb6f92',
          500: '#ef4d78',
          600: '#d92e5c',
          700: '#b51f48',
          800: '#951c3f',
          900: '#7d1b39',
        },
        cream: '#fdf8f3',
        ink: '#1a1a1a',
        muted: '#6b7280',
        price: '#e11d48', // Yangi narx uchun QIZIL rang
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 12px rgba(0,0,0,0.06)',
        sheet: '0 -8px 32px rgba(0,0,0,0.14)',
        nav: '0 -2px 16px rgba(0,0,0,0.06)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      keyframes: {
        'slide-up': {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'slide-up': 'slide-up 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
        'fade-in': 'fade-in 0.25s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
      },
    },
  },
  plugins: [],
};

export default config;
