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
        dark: {
          bg: '#030712',       // Slate 950 (Rich Black)
          panel: '#0a0f1d',    // Deep Navy Blue
          card: '#111827',     // Gray 900
          border: '#1f2937',   // Gray 800
          accent: '#2563eb',   // Blue 600
          accentHover: '#1d4ed8' // Blue 700
        },
        nepal: {
          red: '#dc2626',      // Nepal Flag Crimson
          blue: '#1e3a8a'      // Nepal Flag Blue
        }
      },
      fontFamily: {
        sans: ['Inter', 'Outfit', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glow': '0 0 15px rgba(59, 130, 246, 0.5)',
      },
      backdropBlur: {
        'xs': '2px',
      }
    },
  },
  plugins: [],
}
