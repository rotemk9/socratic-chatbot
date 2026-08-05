// Provide type information and autocomplete support for the Tailwind CSS configuration
/** @type {import('tailwindcss').Config} */

// Export the Tailwind CSS configuration
export default {
  // Enable dark mode when the "dark" class is added to an element
  darkMode: 'class', // <--- ADD THIS LINE!

  // Define the files Tailwind should scan for CSS class names
  content: [
    // Scan the main HTML file
    "./index.html",

    // Scan all supported source files inside the src folder
    "./src/**/*.{js,ts,jsx,tsx}",
  ],

  // Configure the project's Tailwind theme
  theme: {
    // Add custom theme settings without replacing Tailwind's default theme
    extend: {},
  },

  // Add Tailwind CSS plugins to this array
  plugins: [],
}