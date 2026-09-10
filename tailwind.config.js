/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        saffron: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
          950: '#431407',
        },
        india: {
          saffron: '#E06D14',
          saffronLight: '#FF8833',
          saffronDark: '#B94F00',
          green: '#0D7A57',
          greenLight: '#10B981',
          greenDark: '#065F46',
          navy: '#0F172A',
          navyLight: '#1E293B',
          sand: '#FBF8F2',
          gold: '#D97706',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Merriweather', 'Georgia', 'serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'card': '0 10px 25px -5px rgba(15, 23, 42, 0.08)',
        'glow': '0 0 25px rgba(224, 109, 20, 0.25)',
      }
    },
  },
  plugins: [],
}
