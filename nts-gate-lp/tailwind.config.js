/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ["var(--font-noto-sans-jp)", "sans-serif"],
        body: ["var(--font-noto-sans-jp)", "sans-serif"],
        display: ["var(--font-sora)", "sans-serif"],
      },
      colors: {
        primary: {
          900: "var(--primary-900)",
          700: "var(--primary-700)",
          500: "var(--primary-500)",
          300: "var(--primary-300)",
          200: "var(--primary-200)",
          100: "var(--primary-100)",
          50: "var(--primary-50)",
        },
        accent: {
          600: "var(--accent-600)",
          500: "var(--accent-500)",
          100: "var(--accent-100)",
        },
        neutral: {
          900: "var(--neutral-900)",
          700: "var(--neutral-700)",
          600: "var(--neutral-600)",
          500: "var(--neutral-500)",
          200: "var(--neutral-200)",
          100: "var(--neutral-100)",
          50: "var(--neutral-50)",
        },
        success: "var(--success)",
        info: "var(--info)",
        warning: "var(--warning)",
      },
      spacing: {
        "space-1": "var(--space-1)",
        "space-2": "var(--space-2)",
        "space-3": "var(--space-3)",
        "space-4": "var(--space-4)",
        "space-6": "var(--space-6)",
        "space-8": "var(--space-8)",
        "space-12": "var(--space-12)",
        "space-16": "var(--space-16)",
        "space-20": "var(--space-20)",
        "space-24": "var(--space-24)",
        "space-32": "var(--space-32)",
        "section-gap": "var(--section-gap)",
      },
      fontSize: {
        hero: "var(--text-hero)",
        h1: "var(--text-h1)",
        h2: "var(--text-h2)",
        h3: "var(--text-h3)",
        body: "var(--text-body)",
        small: "var(--text-small)",
        caption: "var(--text-caption)",
      },
      lineHeight: {
        tight: "var(--leading-tight)",
        normal: "var(--leading-normal)",
        loose: "var(--leading-loose)",
      },
      maxWidth: {
        container: "1120px",
      },
      borderRadius: {
        card: "12px",
      },
    },
  },
  plugins: [],
};
