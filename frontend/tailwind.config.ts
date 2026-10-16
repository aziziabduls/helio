import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-plus-jakarta)', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      colors: {
        background: '#0b0e14',
        surface: '#161b22',
        surfaceCard: '#1a1f29',
        borderSubtle: 'rgba(255, 255, 255, 0.08)',
        brand: {
          DEFAULT: '#3b82f6',
          dark: '#2563eb',
          glow: 'rgba(59, 130, 246, 0.3)',
        },
      },
      borderRadius: {
        squircle: '1.25rem',
      },
      boxShadow: {
        card: '0 4px 20px -2px rgba(0, 0, 0, 0.5)',
        glow: '0 0 35px -5px rgba(59, 130, 246, 0.4)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
