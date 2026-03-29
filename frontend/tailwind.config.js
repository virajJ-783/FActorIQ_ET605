/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy:    { DEFAULT: '#0B1120', 800: '#111827', 700: '#1a2640', 600: '#1e3a5f' },
        cyan:    { DEFAULT: '#00D4FF', 400: '#22d3ee', dim: '#0ea5e960' },
        coral:   { DEFAULT: '#FF6B6B', dark: '#c0392b' },
        gold:    { DEFAULT: '#FFD700', dim: '#f59e0b' },
        mint:    { DEFAULT: '#00FFAA', dim: '#10b98160' },
        purple:  { DEFAULT: '#8B5CF6', dim: '#7c3aed60' },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body:    ['"DM Sans"',      'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        glow:       '0 0 20px rgba(0,212,255,0.25)',
        'glow-gold':'0 0 20px rgba(255,215,0,0.3)',
        'glow-coral':'0 0 20px rgba(255,107,107,0.3)',
      },
      animation: {
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'float':      'float 3s ease-in-out infinite',
        'slide-in':   'slideIn 0.4s ease-out',
        'fade-up':    'fadeUp 0.5s ease-out',
      },
      keyframes: {
        float:   { '0%,100%': { transform:'translateY(0)' }, '50%': { transform:'translateY(-8px)' } },
        slideIn: { from: { opacity:0, transform:'translateX(-20px)' }, to: { opacity:1, transform:'translateX(0)' } },
        fadeUp:  { from: { opacity:0, transform:'translateY(16px)' }, to: { opacity:1, transform:'translateY(0)' } },
      },
    },
  },
  plugins: [],
}
