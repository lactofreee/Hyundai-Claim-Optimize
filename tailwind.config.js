/** @type {import('tailwindcss').Config} */
module.exports = {
  // Tailwind v4 uses CSS variables by default. 
  // This config is provided for semantic grouping and documentation 
  // as requested for senior-level project management.
  theme: {
    extend: {
      colors: {
        // Semantic Brand Colors
        primary: {
          DEFAULT: 'var(--primary)',
          on: 'var(--on-primary)',
          container: 'var(--primary-container)',
          'on-container': 'var(--on-primary-container)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          on: 'var(--on-secondary)',
        },
        // UI State Colors
        error: {
          DEFAULT: 'var(--error)',
          on: 'var(--on-error)',
        },
        success: {
          DEFAULT: 'var(--success)',
          on: 'var(--on-success)',
        },
        // Surface & Background
        surface: {
          DEFAULT: 'var(--surface)',
          on: 'var(--on-surface)',
          variant: 'var(--surface-variant)',
          'on-variant': 'var(--on-surface-variant)',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
