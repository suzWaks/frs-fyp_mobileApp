/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Light theme colors
        light: {
          background: "#FFFFFF",
          foreground: "#11181C",
          primary: "#7647EB",
          secondary: "#0071FF",
          success: "#47EB76",
          info: "#04BAF2",
          warning: "#FF9D00",
          danger: "#FF2D26",
        },
        // Dark theme colors
        dark: {
          background: "#1a1b26",
          foreground: "#a9b1d6",
          primary: "#7647EB",
          secondary: "#0071FF",
          success: "#28db71",
          info: "#3290ff",
          warning: "#ffa700",
          danger: "#ff6565",
        },
        // Add all the color shades from your NextUI config
        primary: {
          100: "#E8DAFE",
          200: "#D0B6FD",
          300: "#B490F9",
          400: "#9C73F3",
          500: "#7647EB",
          600: "#5A33CA",
          700: "#4223A9",
          800: "#2D1688",
          900: "#1E0D70",
          DEFAULT: "#7647EB",
        },
        secondary: {
          100: "#CCEBFF",
          200: "#99D3FF",
          300: "#66B7FF",
          400: "#3F9DFF",
          500: "#0071FF",
          600: "#0057DB",
          700: "#0040B7",
          800: "#002D93",
          900: "#00207A",
          DEFAULT: "#0071FF",
        },
        success: {
          100: "#DEFEDA",
          200: "#B6FDB6",
          300: "#90F99A",
          400: "#73F38B",
          500: "#47EB76",
          600: "#33CA6D",
          700: "#23A964",
          800: "#168858",
          900: "#0D7050",
          DEFAULT: "#47EB76",
        },
        info: {
          100: "#CCFEFB",
          200: "#99FBFD",
          300: "#66EDFB",
          400: "#40D9F7",
          500: "#04BAF2",
          600: "#0291D0",
          700: "#026CAE",
          800: "#014D8C",
          900: "#003774",
          foreground: "#11181C",
          DEFAULT: "#04BAF2",
        },
        warning: {
          100: "#FFF3CC",
          200: "#FFE399",
          300: "#FFD066",
          400: "#FFBC3F",
          500: "#FF9D00",
          600: "#DB7E00",
          700: "#B76200",
          800: "#934900",
          900: "#7A3800",
          foreground: "#11181C",
          DEFAULT: "#FF9D00",
        },
        danger: {
          100: "#FFE3D3",
          200: "#FFC1A8",
          300: "#FF977C",
          400: "#FF6F5C",
          500: "#FF2D26",
          600: "#DB1B25",
          700: "#B71329",
          800: "#930C2A",
          900: "#7A072A",
          foreground: "#11181C",
          DEFAULT: "#FF2D26",
        }
      },
    },
  },
  darkMode: "class",
  plugins: [],
};