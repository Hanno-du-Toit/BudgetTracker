/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Base dark surfaces
        surface: {
          DEFAULT: '#0f1117',
          50:  '#1a1d27',
          100: '#21253a',
          200: '#2a2f45',
          300: '#343a52',
        },
        // Brand accent — violet
        brand: {
          DEFAULT: '#7c5cfc',
          light:   '#9d82fd',
          dark:    '#5a3ddb',
        },
        // Semantic
        income:  '#22c55e',
        expense: '#f87171',
        // Category palette (used in charts / badges)
        cat: {
          groceries:     '#34d399',
          fuel:          '#fb923c',
          rent:          '#60a5fa',
          entertainment: '#a78bfa',
          dining:        '#f472b6',
          utilities:     '#facc15',
          healthcare:    '#2dd4bf',
          transport:     '#38bdf8',
          shopping:      '#e879f9',
          education:     '#4ade80',
          travel:        '#fb7185',
          subscriptions: '#818cf8',
          income:        '#22c55e',
          other:         '#94a3b8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl:  '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        glow: '0 0 20px rgba(124, 92, 252, 0.3)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        first: 'moveVertical 30s ease infinite',
        second: 'moveInCircle 20s reverse infinite',
        third: 'moveInCircle 40s linear infinite',
        fourth: 'moveHorizontal 40s ease infinite',
        fifth: 'moveInCircle 20s ease infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        moveHorizontal: {
          '0%': { transform: 'translateX(-50%) translateY(-10%)' },
          '50%': { transform: 'translateX(50%) translateY(10%)' },
          '100%': { transform: 'translateX(-50%) translateY(-10%)' },
        },
        moveInCircle: {
          '0%': { transform: 'rotate(0deg)' },
          '50%': { transform: 'rotate(180deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        moveVertical: {
          '0%': { transform: 'translateY(-50%)' },
          '50%': { transform: 'translateY(50%)' },
          '100%': { transform: 'translateY(-50%)' },
        },
      },
    },
  },
  plugins: [],
}
