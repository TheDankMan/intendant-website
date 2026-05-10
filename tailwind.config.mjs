/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,ts}'],
  theme: {
    extend: {
      colors: {
        navy:        'rgb(var(--color-navy))',
        'navy-mid':  'rgb(var(--color-navy-mid))',
        slate:       'rgb(var(--color-slate))',
        brass:       'rgb(var(--color-brass))',
        'brass-dark':'rgb(var(--color-brass-dark))',
        surface:     'rgb(var(--color-surface))',
        'surface-2': 'rgb(var(--color-surface-2))',
        'body-text': 'rgb(var(--color-body-text))',
        muted:       'rgb(var(--color-muted))',
      },
      fontFamily: {
        display: ["'Barlow Condensed'", "'Arial Narrow'", 'Arial', 'sans-serif'],
        body:    ["'Inter Tight'", "'Inter'", 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
