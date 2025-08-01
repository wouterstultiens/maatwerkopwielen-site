/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx}', './public/**/*.svg'],
  theme: {
    container: {
      center: true,
      padding: '1rem',
      screens: { sm: '100%', md: '100%', lg: '1024px', xl: '1280px', '2xl': '1440px' },
    },
    extend: {
      colors: {
        'trust-blue': '#183153',
        coral: '#FF6B5E',
        'honey-gold': '#D4AF37',
        'snow-gray': '#F9FAFC',
        charcoal: '#212529',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['\"Playfair Display\"', 'serif'],
      },
    },
  },
  plugins: [],
};
