// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx}'],
  theme: {
    container: {
      center: true,
      screens: {
        sm: '100%',
        md: '100%',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1440px',
      },
    },
    extend: {
      colors: {
              navy: '#0B1F3A',
              gold: '#D4AF37',
              grey: '#F5F5F5',
              coral: '#FF6F61',
            },
      fontFamily: {
              heading: ['Merriweather', 'serif'],
              body: ['Roboto', 'sans-serif'],
            },
    },
  },
  plugins: [],
};
