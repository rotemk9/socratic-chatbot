// Import ESLint's official JavaScript rules
import js from '@eslint/js'

// Import predefined global variables for different environments
import globals from 'globals'

// Import ESLint rules for React Hooks
import reactHooks from 'eslint-plugin-react-hooks'

// Import ESLint rules for React Fast Refresh
import reactRefresh from 'eslint-plugin-react-refresh'

// Import helpers for defining the ESLint configuration
import { defineConfig, globalIgnores } from 'eslint/config'

// Export the complete ESLint configuration
export default defineConfig([
  // Ignore the generated production build folder
  globalIgnores(['dist']),

  {
    // Apply this configuration to all JavaScript and JSX files
    files: ['**/*.{js,jsx}'],

    // Extend the recommended ESLint, React Hooks, and Vite rules
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],

    // Configure JavaScript language settings
    languageOptions: {
      // Define browser variables such as window and document as global variables
      globals: globals.browser,

      // Enable JSX syntax support
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
])