/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Replaced blue palette with executive Charcoal Gray palette
        blue: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#334155', // Primary Charcoal Gray
          700: '#1e293b', // Deep Charcoal
          800: '#0f172a', // Dark Charcoal
          900: '#090d16', // Midnight Charcoal
          950: '#030712',
        },
        gov: {
          navy: '#1e293b', // Charcoal Navy
          blue: '#334155', // Charcoal Gray
          light: '#F8FAFC',
          gold: '#D97706',
          ashoka: '#0f172a', // Dark Charcoal
          dark: '#0B1528',
          border: '#E2E8F0',
        },
        risk: {
          low: '#10B981',
          medium: '#F59E0B',
          high: '#F97316',
          critical: '#EF4444',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
