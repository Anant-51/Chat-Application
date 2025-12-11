/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./node_modules/flowbite-react/**/*.{js,jsx,ts,tsx}", // ensures Flowbite styles are included
    "./node_modules/flowbite/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Neutral palette
        "neutral-primary": "#ffffff",
        "neutral-secondary-soft": "#f4f4f5",
        "neutral-tertiary": "#e5e7eb",
        "neutral-tertiary-medium": "#d1d5db",

        // Text
        "text-body": "#6B7280", // gray text
        "text-heading": "#111827", // dark heading text

        // Accent / message colors
        "blue-500": "#3b82f6", // sent message background
        "blue-100": "#bfdbfe", // sent message text/status
      },

      borderRadius: {
        base: "0.5rem", // 8px rounded corners
        "e-base": "0.5rem",
        "es-base": "0.5rem",
      },

      spacing: {
        2.5: "0.625rem", // 10px
        1.5: "0.375rem", // 6px
      },

      maxWidth: {
        320: "20rem", // 320px message bubble width
      },
    },
  },
  plugins: [require("flowbite/plugin")],
};
