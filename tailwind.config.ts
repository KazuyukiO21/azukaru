import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef8f0',
          100: '#fdecd8',
          200: '#fad5a8',
          300: '#f4b06b',
          400: '#e8893d',
          500: '#cf7a2f',
          600: '#b46520',
          700: '#93521a',
          800: '#764115',
          900: '#603511',
          950: '#371a06',
        },
        warm: {
          50: '#fdfaf5',
          100: '#faf3e7',
          200: '#f5e5cd',
          300: '#edd1a8',
          400: '#e3b67e',
          500: '#d9955a',
          600: '#ca7a40',
          700: '#a86135',
          800: '#884f2f',
          900: '#6f4228',
        },
      },
      fontFamily: {
        sans: ['var(--font-noto-sans-jp)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
