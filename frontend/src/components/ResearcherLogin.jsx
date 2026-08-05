// Import React state management
import { useState } from "react";

// Import the service used to authenticate a researcher
import { loginResearcher } from "../services/researcherService";

// Displays the researcher login form
function ResearcherLogin({ onLogin, onBack }) {
  // Store the researcher username and access code
  const [form, setForm] = useState({
    username: "",
    accessCode: "",
  });

  // Store an authentication error message
  const [error, setError] = useState("");

  // Update the matching form field when its input changes
  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  // Authenticate the researcher when the form is submitted
  async function handleSubmit(e) {
    // Prevent the browser from refreshing the page
    e.preventDefault();

    // Clear any previous error message
    setError("");

    try {
      // Send the researcher credentials to the backend
      const data = await loginResearcher(form);

      // Continue to the dashboard after successful authentication
      onLogin(data);
    } catch (err) {
      // Display an error when the credentials are invalid
      setError("Invalid researcher username or access code");
    }
  }

  return (
    <div className="flex w-full flex-col items-center justify-center px-4 py-12 md:pt-[10vh]">
      
      {/* Light/Dark mode glassmorphism card */}
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white/80 p-6 sm:p-8 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-[#1e2333]/80 dark:shadow-2xl">
        {/* Login title and instructions */}
        <div className="mb-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Researcher Login
          </h2>

          <p className="mt-2 text-sm text-slate-500 dark:text-gray-400">
            Enter credentials to access the monitor
          </p>
        </div>

        {/* Submit the researcher credentials through handleSubmit */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Researcher username input */}
          <div>
            <input
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="Researcher username"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 p-3.5 text-slate-900 placeholder-slate-400 transition-all focus:border-purple-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-purple-500 dark:border-transparent dark:bg-[#2a2f42]/80 dark:text-white dark:placeholder-gray-400 dark:focus:bg-[#2a2f42]"
              required
            />
          </div>

          {/* Researcher access-code input */}
          <div>
            <input
              type="password"
              name="accessCode"
              value={form.accessCode}
              onChange={handleChange}
              placeholder="Access code"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 p-3.5 text-slate-900 placeholder-slate-400 transition-all focus:border-purple-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-purple-500 dark:border-transparent dark:bg-[#2a2f42]/80 dark:text-white dark:placeholder-gray-400 dark:focus:bg-[#2a2f42]"
              required
            />
          </div>

          {/* Display an authentication error when login fails */}
          {error && (
            <p className="text-center text-sm font-medium text-red-500 dark:text-red-400">
              {error}
            </p>
          )}

          {/* Login and navigation buttons */}
          <div className="pt-4">
            {/* Submit the login form */}
            <button
              type="submit"
              className="mb-3 w-full rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 py-3.5 font-bold text-white shadow-lg shadow-purple-500/20 transition-all hover:scale-[1.02] hover:shadow-purple-500/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-[#1e2333]"
            >
              Enter Monitor
            </button>

            {/* Return to the previous page */}
            <button
              type="button"
              onClick={onBack}
              className="w-full rounded-lg bg-slate-100 py-3.5 font-bold text-slate-700 transition-all hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-white dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10 dark:focus:ring-offset-[#1e2333]"
            >
              Back
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

// Export the component for use in other parts of the application
export default ResearcherLogin;