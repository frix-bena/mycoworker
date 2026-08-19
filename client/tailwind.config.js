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
          900: '#070b12',
          800: '#0f172a',
          700: '#1e293b',
          600: '#334155',
        },
        category: {
          coding: '#38bdf8',
          music: '#a78bfa',
          work: '#34d399',
          study: '#f59e0b',
          other: '#94a3b8'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      }
    },
  },
  plugins: [],
}
