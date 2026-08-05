// Import the helper used to define the Vite configuration
import { defineConfig } from "vite";

// Import the Vite plugin that enables React support
import react from "@vitejs/plugin-react";

// Import the Tailwind CSS plugin for Vite
import tailwindcss from "@tailwindcss/vite";

// Export the Vite configuration
export default defineConfig({
  // Enable the React and Tailwind CSS plugins
  plugins: [react(), tailwindcss()],
});