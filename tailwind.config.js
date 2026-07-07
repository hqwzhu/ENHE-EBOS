/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#17202a",
        panel: "#f7f8fa",
        line: "#d9dee7",
        action: "#0f766e",
        danger: "#b42318",
        warning: "#b54708",
      },
      boxShadow: {
        "soft-panel": "0 14px 42px rgb(17 24 39 / 0.08)",
      },
    },
  },
  plugins: [],
};
