// Import React hooks for managing the theme state and applying theme changes
import { useState, useEffect } from "react";

// Import Link for navigating to the home page without refreshing the application
import { Link } from "react-router-dom"; 

// Displays the application header with branding, theme control, and optional logout
function Header({ showLogout, onLogout }) {
  // 1. Initialize state from localStorage so it remembers the user's preference!
  // Defaults to 'true' (dark) if they've never visited before.
  const [isDark, setIsDark] = useState(() => {
    // Read the previously selected theme from the browser
    const savedTheme = localStorage.getItem("theme");

    // Use the saved theme, or dark mode when no preference exists
    return savedTheme ? savedTheme === "dark" : true;
  });

  // 2. Apply the class to the HTML tag and save to localStorage on every change
  useEffect(() => {
    if (isDark) {
      // Enable dark-mode Tailwind styles
      document.documentElement.classList.add("dark");

      // Save the dark theme preference
      localStorage.setItem("theme", "dark");
    } else {
      // Disable dark-mode Tailwind styles
      document.documentElement.classList.remove("dark");

      // Save the light theme preference
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  return (
    <header className="sticky left-0 top-0 z-50 w-full border-b border-slate-200 bg-white/80 px-4 py-4 sm:px-6 sm:py-5 shadow-sm backdrop-blur-xl transition-all dark:border-white/5 dark:bg-[#1e2333]/80 dark:shadow-lg">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
        
        {/* Left Side: Clickable Logo & Subtitle */}
        <div className="text-center md:text-left">
          {/* Navigate to the home page when the logo is selected */}
          <Link 
            to="/" 
            className="group inline-block focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-[#1e2333] rounded-lg"
          >
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 transition-colors group-hover:text-purple-600 dark:text-white dark:group-hover:text-purple-400">
              SystemThinker AI
            </h1>
          </Link>

          {/* Brief description of the application */}
          <p className="mt-1 text-xs sm:text-sm font-medium text-slate-500 dark:text-gray-400">
            AI-based Socratic chatbot for Systems Thinking research
          </p>
        </div>

        {/* Right Side: Badge, Theme Toggle, and Logout */}
        <div className="flex items-center justify-center gap-3 sm:gap-4">
          
          {/* Badge: Hidden on small screens, visible on 'sm' and up */}
          <span className="hidden rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 px-5 py-2 text-sm font-bold text-white shadow-lg shadow-purple-500/20 sm:inline-block">
            Advanced Web Development Project
          </span>

          {/* Theme Toggle Button */}
          <button
            onClick={() => setIsDark(!isDark)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-slate-600 backdrop-blur-md transition-all hover:bg-slate-200 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
            aria-label="Toggle Dark Mode"
          >
            {isDark ? (
              // Sun Icon (Switch to Light Mode)
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              // Moon Icon (Switch to Dark Mode)
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          {/* Logout Button */}
          {/* Display the button only when logout is available */}
          {showLogout && (
            <button
              onClick={onLogout}
              className="rounded-xl border border-red-200 bg-red-50 px-5 py-2 text-sm font-bold text-red-600 backdrop-blur-md transition-all hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 dark:border-white/5 dark:bg-white/5 dark:text-red-400 dark:hover:bg-red-500/20"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

// Export the component for use in other parts of the application
export default Header;