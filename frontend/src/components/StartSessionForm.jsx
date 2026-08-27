// Import React state management
import { useState } from "react";

// Import the session context used to start a new student session
import { useSession } from "../Context/SessionContext";

// Displays the form used to create a new student session.
function StartSessionForm({ onBack }) {
  // Get the function responsible for starting the student session
  const { startStudentSession } = useSession();

  // Store the student's entered information
  const [formData, setFormData] = useState({
    name: "",
    studentId: "",
    gender: "",
  });

  // Store an error message if the session cannot be started
  const [error, setError] = useState("");

  // Update the matching form field whenever an input changes
  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  // Submit the student information and start a new session
  async function handleSubmit(e) {
    // Prevent the browser from refreshing the page
    e.preventDefault();

    // Clear any previous error message
    setError("");

    // Require a full name before starting the session
    if (!formData.name.trim()) {
      setError("יש להזין שם מלא");
      return;
    }

    // Require the participant to choose a gender
    if (!formData.gender) {
      setError("יש לבחור מין");
      return;
    }

    try {
      // Send the student information through the session context. The backend
      // recognizes the researcher test account (ID 1234567 / name Admin) by
      // its credentials, so no extra flag is needed here.
      await startStudentSession({ ...formData });
    } catch (err) {
      // Display an error if the session cannot be started
      setError("Failed to start session");
      console.error(err);
    }
  }

  return (
    <div className="flex w-full flex-col items-center justify-center px-4 py-12 md:pt-[10vh]">
      
      {/* Light/Dark mode glassmorphism card */}
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white/80 p-6 sm:p-8 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-[#1e2333]/80 dark:shadow-2xl">
        {/* Form title and instructions */}
        <div className="mb-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            SystemThinker AI
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-gray-400" dir="rtl">
            מלא את פרטיך כדי להתחיל בשיחה
          </p>
        </div>

        {/* Submit the student details through handleSubmit.
            autoComplete="off" stops the browser from suggesting previously typed
            values (that dropdown is per-device browser history, not app data). */}
        <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off" dir="rtl">
          {/* Student full-name input (required) */}
          <div>
            <input
              name="name"
              autoComplete="off"
              value={formData.name}
              onChange={handleChange}
              placeholder="שם מלא"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 p-3.5 text-right text-slate-900 placeholder-slate-400 transition-all focus:border-purple-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-purple-500 dark:border-transparent dark:bg-[#2a2f42]/80 dark:text-white dark:placeholder-gray-400 dark:focus:bg-[#2a2f42]"
              required
            />
          </div>

          {/* Optional student ID input */}
          <div>
            <input
              name="studentId"
              autoComplete="off"
              value={formData.studentId}
              onChange={handleChange}
              placeholder="תעודת זהות (לא חובה)"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 p-3.5 text-right text-slate-900 placeholder-slate-400 transition-all focus:border-purple-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-purple-500 dark:border-transparent dark:bg-[#2a2f42]/80 dark:text-white dark:placeholder-gray-400 dark:focus:bg-[#2a2f42]"
            />
          </div>

          {/* Gender selection (required) — only זכר / נקבה */}
          <div>
            <p className="mb-2 text-sm font-medium text-slate-600 dark:text-slate-300">מין</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: "male", label: "זכר" },
                { value: "female", label: "נקבה" },
              ].map((option) => (
                <label
                  key={option.value}
                  className={`flex cursor-pointer items-center justify-center rounded-lg border p-3 text-sm font-bold transition-all ${
                    formData.gender === option.value
                      ? "border-purple-500 bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-300"
                      : "border-slate-200 bg-slate-50 text-slate-600 hover:border-purple-300 dark:border-transparent dark:bg-[#2a2f42]/80 dark:text-slate-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="gender"
                    value={option.value}
                    checked={formData.gender === option.value}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </div>

          {/* Display an error message when session creation fails */}
          {error && (
            <p className="text-center text-sm font-medium text-red-500 dark:text-red-400">
              {error}
            </p>
          )}

          {/* Start the student session */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 py-3.5 font-bold text-white shadow-lg shadow-purple-500/20 transition-all hover:scale-[1.02] hover:shadow-purple-500/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-[#1e2333]"
            >
              Start Session
            </button>
          </div>

          {/* Return to the landing page */}
          <div className="mt-4 text-center">
            <button 
              type="button"
              onClick={onBack} 
              className="text-sm font-medium text-slate-500 hover:text-purple-600 dark:text-slate-400 dark:hover:text-purple-400 transition-colors"
            >
              &larr; Back to Home
            </button>
          </div>

        </form>
      </section>
    </div>
  );
}

// Export the component for use in other parts of the application
export default StartSessionForm;
