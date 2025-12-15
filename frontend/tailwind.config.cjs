/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Avenir', 'Helvetica', 'Arial', 'sans-serif'],
      },
      colors: {
        // Tema Escuro Base
        'bg-primary': '#0f172a',
        'bg-secondary': '#1e293b',
        'bg-tertiary': '#334155',
        
        // Glassmorphism
        'glass': {
          'bg': 'rgba(255, 255, 255, 0.1)',
          'border': 'rgba(255, 255, 255, 0.2)',
          'shadow': 'rgba(0, 0, 0, 0.1)',
        },
        
        // Cores Médicas
        'medical': {
          'blue': '#3b82f6',
          'green': '#22c55e',
          'red': '#ef4444',
          'orange': '#f59e0b',
          'purple': '#8b5cf6',
        },
        
        // Prioridades Manchester
        'priority': {
          'red': '#dc2626',
          'orange': '#ea580c',
          'yellow': '#ca8a04',
          'green': '#16a34a',
          'blue': '#2563eb',
        },
        
        // Texto
        'text': {
          'primary': '#f8fafc',
          'secondary': '#cbd5e1',
          'muted': '#64748b',
        },

        // Bordas
        'border': 'rgba(255, 255, 255, 0.1)',
      },
      backdropBlur: {
        '2': '2px',
        'xs': '2px',
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '24px',
        '3xl': '40px',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'glass-shimmer': 'glassShimmer 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        glassShimmer: {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '0.8' },
        },
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'glass-lg': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'glass-xl': '0 35px 60px -12px rgba(0, 0, 0, 0.25)',
      },
    },
  },
  plugins: [],
}