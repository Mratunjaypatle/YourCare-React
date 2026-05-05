// tailwind.config.js
// ─────────────────────────────────────────────────────────────
// darkMode: 'class' is THE KEY setting.
// It tells Tailwind to activate dark: variants when
// the <html> element has class="dark"
// ─────────────────────────────────────────────────────────────

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],

  // 'class' = dark mode is controlled by adding/removing
  //           the 'dark' class on <html> element
  // (alternative is 'media' which follows system setting only)
  darkMode: 'class',

  theme: {
    extend: {
      // Custom transition for smooth theme switching
      transitionProperty: {
        'theme': 'background-color, border-color, color, fill, stroke',
      },
      transitionDuration: {
        'theme': '200ms',
      },
      colors: {
        // These become available as bg-surface, text-primary etc.
        // But we'll use CSS variables for flexibility — see index.css
      },
    },
  },
  plugins: [],
}