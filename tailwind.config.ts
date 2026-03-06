import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f2f7ff",
          100: "#e5efff",
          200: "#bed7ff",
          300: "#8db8ff",
          400: "#568fff",
          500: "#2968ff",
          600: "#1349f6",
          700: "#103adc",
          800: "#1534af",
          900: "#19358a"
        }
      }
    }
  },
  plugins: []
};

export default config;
