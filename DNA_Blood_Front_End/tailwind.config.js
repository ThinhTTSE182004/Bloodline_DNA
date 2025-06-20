/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f7ff',
          100: '#e0f0ff',
          200: '#bae0ff',
          300: '#7cc5ff',
          400: '#36a9ff',
          500: '#0090ff',
          600: '#0072cc',
          700: '#005999',
          800: '#004066',
          900: '#002233',
        },
        secondary: '#6C757D',
        dark: '#212529',
        light: '#F8F9FA',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'fade-in-delay': 'fadeIn 0.5s ease-in-out 0.3s both',
        'fade-in-delay-2': 'fadeIn 0.5s ease-in-out 0.6s both',
        'fade-in-delay-3': 'fadeIn 0.5s ease-in-out 0.9s both',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.5s ease-out',
        'slide-left': 'slideLeft 0.5s ease-out',
        'slide-right': 'slideRight 0.5s ease-out',
        'bounce-slow': 'bounce 3s infinite',
        'hover-scale': 'hoverScale 0.2s ease-in-out',
      },
      keyframes: {
        imageEffects: {
          '0%': { borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%' },
          '25%': { borderRadius: '35% 65% 27% 73% / 71% 25% 75% 29%' },
          '50%': { borderRadius: '41% 59% 45% 55% / 32% 21% 79% 68%' },
          '75%': { borderRadius: '69% 31% 39% 61% / 70% 83% 17% 30%' },
          '100%': { borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideLeft: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideRight: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        hoverScale: {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(1.05)' },
        },
      },
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
      }
    },
  },
  plugins: [],
}

