/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0F7A6B',
          light: '#14B8A6',
          dark: '#0B5D52',
          50: '#F0FDF9',
          100: '#CCFBF1',
          200: '#99F6E4',
          500: '#14B8A6',
          700: '#0F7A6B',
          800: '#0B5D52',
          900: '#06423A',
        },
        secondary: {
          DEFAULT: '#3B82F6',
          light: '#93C5FD',
          dark: '#1D4ED8',
          50: '#EFF6FF',
          100: '#DBEAFE',
        },
        severity: {
          0: '#2FA37A', // No Disease (soft green)
          1: '#7BB661', // Mild (yellow-green)
          2: '#E0A63C', // Moderate (amber)
          3: '#D9713C', // Severe (soft orange-red)
          4: '#B84C4C', // Very Severe (muted red)
        },
        bg: '#F7FAF9',
        surface: '#FFFFFF',
        border: '#E2E8E6',
        'text-primary': '#1A2E2A',
        'text-secondary': '#5B6B67',
        'text-muted': '#8A9995',
        success: '#2FA37A',
        warning: '#E0A63C',
        error: '#C0392B',
        info: '#3B82F6',
      },
      fontFamily: {
        heading: ['Sora', 'Space Grotesk', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(15, 122, 107, 0.05)',
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.04)',
        'md': '0 4px 6px -1px rgba(15, 122, 107, 0.08), 0 2px 4px -2px rgba(15, 122, 107, 0.05)',
        'lg': '0 10px 15px -3px rgba(15, 122, 107, 0.08), 0 4px 6px -4px rgba(15, 122, 107, 0.03)',
      },
      animation: {
        'pulse-calm': 'pulseCalm 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'heartbeat': 'heartbeat 1.5s ease-in-out infinite',
      },
      keyframes: {
        pulseCalm: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.7', transform: 'scale(0.97)' },
        },
        heartbeat: {
          '0%': { transform: 'scale(1)' },
          '14%': { transform: 'scale(1.15)' },
          '28%': { transform: 'scale(1)' },
          '42%': { transform: 'scale(1.15)' },
          '70%': { transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}
