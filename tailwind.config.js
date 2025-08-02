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
      /* colour tokens read from CSS variables (kept!) */
      colors: {
        primary:   'rgb(var(--primary) / <alpha-value>)',
        secondary: 'rgb(var(--secondary) / <alpha-value>)',
        accent:    'rgb(var(--accent) / <alpha-value>)',
        surface:   'rgb(var(--surface) / <alpha-value>)',
        neutral:   'rgb(var(--neutral) / <alpha-value>)',

        /* legacy names already used */
        'trust-blue':  'rgb(var(--primary) / <alpha-value>)',
        coral:         'rgb(var(--accent)  / <alpha-value>)',
        'honey-gold':  'rgb(var(--secondary) / <alpha-value>)',
        'snow-gray':   'rgb(var(--surface) / <alpha-value>)',
        charcoal:      'rgb(var(--neutral) / <alpha-value>)',
      },

      fontFamily: {
        sans:  ['Inter', 'sans-serif'],
        serif: ['"Playfair Display"', 'serif'],
      },

      /* enable smooth transform transitions (navbar) */
      transitionProperty: {
        transform: 'transform',
      },
    },
  },
  plugins: [],
};
