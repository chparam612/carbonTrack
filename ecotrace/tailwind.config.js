/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        forest: {
          900: '#1a2e1a',
          800: '#2d5016',
          700: '#1a5c3a',
          600: '#4d8528',
          500: '#5d9f31',
        },
        brown: {
          800: '#8B4513',
          600: '#D2691E',
          400: '#CD853F',
        },
        cream: {
          100: '#F5F0E8',
          200: '#f5f0e8',
          300: '#DDD5C4',
        },
        gold: {
          500: '#DAA520',
          400: '#E8B830',
          300: '#F0CC50',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
