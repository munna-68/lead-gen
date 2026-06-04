import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          0: '#0a0a0a',
          1: '#0f0f0f',
          2: '#141414',
          3: '#1a1a1a',
          4: '#222222',
          5: '#2a2a2a',
          6: '#363636',
        },
        fog: {
          1: '#ededed',
          2: '#a3a3a3',
          3: '#737373',
          4: '#525252',
          5: '#404040',
        },
        amber: {
          DEFAULT: '#f59e0b',
          soft: '#fbbf24',
          dim: '#78350f',
        },
        status: {
          new: '#737373',
          contacted: '#3b82f6',
          engaged: '#eab308',
          pitched: '#a855f7',
          no_response: '#ef4444',
          closed: '#22c55e',
          dead: '#404040',
        },
        quality: {
          warm: '#f59e0b',
          cold: '#737373',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        sans: ['var(--font-sans)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem', letterSpacing: '0.04em' }],
      },
      letterSpacing: {
        tightest: '-0.04em',
        'extra-wide': '0.18em',
      },
      animation: {
        'fade-up': 'fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-in': 'fadeIn 0.4s ease both',
        'slide-in-right': 'slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1) both',
        'pulse-soft': 'pulseSoft 2.4s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
