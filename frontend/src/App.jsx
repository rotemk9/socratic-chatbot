// Import React state management
import { useState } from "react";

// Import routing components and navigation hooks
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";

// Import the main application components
import Header from "./components/Header";
import LandingPage from "./components/LandingPage";
import ChatBox from "./components/Chat/ChatBox";
import SidePanel from "./components/SidePanel/SidePanel";
import DashboardPreview from "./components/Dashboard/DashboardPreview";
import ResearchAnalytics from "./components/Dashboard/ResearchAnalytics";
import StartSessionForm from "./components/StartSessionForm";
import ResearcherLogin from "./components/ResearcherLogin";
import WaitingScreen from "./components/WaitingScreen";
import AdminStudents from "./components/Dashboard/AdminStudents";
import ExportData from "./components/Dashboard/ExportData";

// Import the shared session context
import { useSession } from "./Context/SessionContext";

// Main application component that controls routing and page access
function App() {
  // Get the active student session and the function used to clear it
  const { sessionInfo, clearSession } = useSession();

  // Store the authenticated researcher information
  const [researcher, setResearcher] = useState(null);

  // Programmatically navigate between application routes
  const navigate = useNavigate();

  // Clear student and researcher data and return to the landing page
  function handleLogout() {
    setResearcher(null);
    clearSession();
    navigate("/"); // Instantly kicks them back to the landing page URL
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-[#0f121b] dark:text-white">
      
      {/* Display the main header and show logout when a user is active */}
      <Header 
        showLogout={!!(sessionInfo || researcher)} 
        onLogout={handleLogout} 
      />

      {/* Main application content and routing area */}
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col p-4 md:p-6">
        <Routes>
          
          {/* 1. Landing Page */}
          <Route 
            path="/" 
            element={
              <div className="flex flex-1 items-center justify-center">
                <LandingPage 
                  onStudentClick={() => navigate("/login")}
                  onResearcherClick={() => navigate("/admin")}
                />
              </div>
            } 
          />

          {/* 2. Student Login */}
          {/* Redirect active students to their session */}
          <Route 
            path="/login" 
            element={
              sessionInfo ? <Navigate to="/session" /> : <StartSessionForm onBack={() => navigate("/")} />
            } 
          />

          {/* 3. Researcher Login */}
          {/* Redirect authenticated researchers to the dashboard */}
          <Route 
            path="/admin" 
            element={
              researcher ? <Navigate to="/dashboard" /> : (
                <ResearcherLogin
                  onLogin={(data) => {
                    setResearcher(data);
                    navigate("/dashboard");
                  }}
                  onBack={() => navigate("/")}
                />
              )
            } 
          />

          {/* 4. Researcher Dashboard */}
          {/* Protect the dashboard from unauthenticated access */}
          <Route 
            path="/dashboard" 
            element={
              researcher ? (
                <div className="space-y-6">
                  {/* Participant management: view, approve, and assign groups */}
                  <AdminStudents />

                  {/* Export student data (CSV for all + per-student JSON) */}
                  <ExportData />

                  {/* Display general research statistics */}
                  <ResearchAnalytics />

                  {/* Display individual student progress information */}
                  <DashboardPreview />
                </div>
              ) : <Navigate to="/admin" />
            } 
          />

          {/* 5. The Active Chat Session (FIXED) */}
          <Route 
            path="/session" 
            element={
              !sessionInfo ? (
                // Redirect users without an active session to student login
                <Navigate to="/login" />
              ) : sessionInfo.group === "Pending" ? (
                // Hold the student on a waiting screen until the researcher
                // assigns them a group
                <WaitingScreen />
              ) : sessionInfo.status === "completed" ? (
                // Show a simple end-of-session screen once the time is up
                // (the pre/post questionnaires were removed — the platform is
                // now just the Socratic chatbot)
                <div className="flex flex-1 items-center justify-center">
                  <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white/80 p-8 text-center shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-[#1e2333]/80" dir="rtl">
                    <div className="mb-4 text-4xl">✅</div>
                    <h2 className="mb-2 text-2xl font-extrabold text-slate-900 dark:text-white">
                      השיחה הסתיימה
                    </h2>
                    <p className="mb-5 text-sm text-slate-600 dark:text-slate-300">
                      תודה רבה על השתתפותך במחקר. לסיום, יש למלא את השאלון המסכם:
                    </p>

                    {/* Post-session questionnaire — the link is chosen by the
                        participant's research group (experimental vs. control) */}
                    <a
                      href={
                        sessionInfo.group === "Control Group"
                          ? "https://forms.gle/wfavVJHx4gmLLW9P8"
                          : "https://forms.gle/Z6FzNyVsKDmekjAj6"
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mb-3 block w-full rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 py-3 font-bold text-white shadow-lg transition-all hover:scale-[1.02]"
                    >
                      מילוי השאלון המסכם ↗
                    </a>

                    <button
                      onClick={handleLogout}
                      className="w-full rounded-lg border border-slate-300 py-3 font-bold text-slate-600 transition-all hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
                    >
                      סיום וחזרה לדף הבית
                    </button>
                  </div>
                </div>
              ) : (
                // Display the active student session interface
                <div className="flex flex-col space-y-6">
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Main chat area */}
                    <div className="lg:col-span-2">
                      <ChatBox />
                    </div>

                    {/* Session information and unlocked gates */}
                    <SidePanel />
                  </div>
                </div>
              )
            } 
          />

          {/* 6. Catch-All */}
          {/* Redirect unknown URLs to the landing page */}
          <Route path="*" element={<Navigate to="/" />} />

        </Routes>
      </div>
    </div>
  );
}

// Export the main application component
export default App;
