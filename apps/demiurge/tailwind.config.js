/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'display': ['Cinzel', 'serif'],
        'body': ['Cormorant Garamond', 'serif'],
      },
      colors: {
        'imperial': {
          'gold': '#D4AF37',
          'gold-light': '#F4D03F',
          'gold-dark': '#B8941F',
        },
        'void': '#050508',
        'space': '#0a0a0f',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.8s ease-out forwards',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'shimmer': 'shimmer 4s linear infinite',
        'twinkle': 'twinkle 8s ease-in-out infinite',
      },
      boxShadow: {
        'glow-gold': '0 0 20px rgba(212, 175, 55, 0.3), 0 0 40px rgba(212, 175, 55, 0.1)',
        'glow-amber': '0 0 20px rgba(251, 191, 36, 0.3), 0 0 40px rgba(251, 191, 36, 0.1)',
      },
    },
  },
  plugins: [],
}
