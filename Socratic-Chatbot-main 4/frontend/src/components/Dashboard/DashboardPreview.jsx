// Import React hooks for loading data and managing component state
import { useEffect, useState } from "react";

// Import the service used to retrieve dashboard data from the backend
import { getDashboardData } from "../../services/dashboardService";

// Import the session context used to detect dashboard updates
import { useSession } from "../../Context/SessionContext";

// Import dashboard components
import DashboardHeader from "./DashboardHeader";
import StudentList from "./StudentList";
import StudentAnalyticsView from "./StudentAnalyticsView";
import StudentChatView from "./StudentChatView";

function DashboardPreview() {
  // Get the dashboard version so the data reloads after session changes
  const { dashboardVersion } = useSession();

  // Store the students returned by the backend
  const [students, setStudents] = useState([]);

  // Track whether the dashboard data is currently loading
  const [loading, setLoading] = useState(true);

  // Store an error message if loading fails
  const [error, setError] = useState("");

  // Store the currently displayed dashboard view
  const [activeView, setActiveView] = useState("list"); 

  // Store the student selected by the researcher
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Load dashboard data when the component opens or dashboardVersion changes
  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");
        
        // Request the dashboard data from the backend
        const data = await getDashboardData();
        
        // SAFETY CHECK: Ensure the backend actually sent an array!
        if (Array.isArray(data)) {
          setStudents(data);
        } else {
          console.error("Dashboard data is not an array:", data);
          setError("Received invalid data format from the server.");
        }
        
      } catch (err) {
        console.error(err);
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [dashboardVersion]);

  // Return to the main student list
  function goBack() {
    setActiveView("list");
    setSelectedStudent(null);
  }

  // Display the selected student's analytics view
  if (activeView === "analytics" && selectedStudent) {
    return <StudentAnalyticsView student={selectedStudent} onBack={goBack} />;
  }

  // Display the selected student's chat view
  if (activeView === "chat" && selectedStudent) {
    return <StudentChatView student={selectedStudent} onBack={goBack} />;
  }

  return (
    <section className="mt-6 rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-xl backdrop-blur-xl transition-colors sm:p-6 lg:p-8 dark:border-white/5 dark:bg-[#1e2333]/80 dark:shadow-2xl">
      {/* Display the dashboard title and description */}
      <DashboardHeader />

      {/* Display a loading spinner while dashboard data is being retrieved */}
      {loading && (
        <div className="flex h-32 items-center justify-center">
          <span className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-purple-600 dark:border-white/10 dark:border-t-purple-500"></span>
        </div>
      )}

      {/* Display an error message if the dashboard request fails */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Display the student list after the data loads successfully */}
      {!loading && !error && (
        <StudentList 
          students={students} 
          onViewAnalytics={(s) => { setSelectedStudent(s); setActiveView("analytics"); }}
          onViewChat={(s) => { setSelectedStudent(s); setActiveView("chat"); }}
        />
      )}
    </section>
  );
}

// Export the component for use in other files
export default DashboardPreview;