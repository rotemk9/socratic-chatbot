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
import ProgressBar from "./components/ProgressBar";
import StartSessionForm from "./components/StartSessionForm";
import ResearcherLogin from "./components/ResearcherLogin";
import WaitingScreen from "./components/WaitingScreen";
import AdminStudents from "./components/Dashboard/AdminStudents";
import ExportData from "./components/Dashboard/ExportData";
import PreTaskSurvey from "./components/Questionnaire/PreTaskSurvey";
import PostTaskSurvey from "./components/Questionnaire/PostTaskSurvey";

// Import the shared session context
import { useSession } from "./Context/SessionContext";

// Main application component that controls routing and page access
function App() {
  // Get the active student session and the function used to clear it
  const { sessionInfo, clearSession } = useSession();

  // Track whether the student completed the pre-task questionnaire
  const [preTaskDone, setPreTaskDone] = useState(false);

  // Store the authenticated researcher information
  const [researcher, setResearcher] = useState(null);

  // Programmatically navigate between application routes
  const navigate = useNavigate();

  // Researcher test account: logging in with ID "1234567" and name "Admin" is
  // tagged by the backend with role "admin". We recognize it by that role (the
  // real ID/name are no longer stored), which reveals the "skip" shortcut.
  const isTestUser = sessionInfo?.role === "admin";

  // Clear student and researcher data and return to the landing page
  function handleLogout() {
    setResearcher(null);
    setPreTaskDone(false);
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
                // assigns them a group (or the automatic fallback kicks in)
                <WaitingScreen />
              ) : !preTaskDone ? (
                // Require the pre-task questionnaire before opening the chat
                // (a Skip button appears here only in dev mode)
                <PreTaskSurvey onDone={() => setPreTaskDone(true)} allowSkip={isTestUser} />
              ) : sessionInfo.status === "completed" ? (
                // Display the post-task questionnaire after session completion
                <PostTaskSurvey onDone={handleLogout} />
              ) : (
                // Display the active student session interface
                <div className="flex flex-col space-y-6">
                  {/* Display progress through the systems-thinking layers */}
                  <ProgressBar />

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