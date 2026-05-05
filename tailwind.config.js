/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        tactical: {
          bg: '#0f0f0f',
          card: '#141414',
          elevated: '#1f1f1f',
          border: '#2a2a2a',
          text: '#e5e5e5',
          muted: '#a3a3a3',
        },
        status: {
          ready: '#22c55e',
          available: '#f59e0b',
          locked: '#ef4444',
          accent: '#3b82f6',
        }
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      }
    },
  },
  plugins: [],
}