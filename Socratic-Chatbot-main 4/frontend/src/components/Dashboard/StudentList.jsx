// Import the component used to display each student's information
import StudentCard from "./StudentCard";

// Displays the list of students in the dashboard
function StudentList({ students, onViewAnalytics, onViewChat }) {
  
  // Show an empty-state message when the student data is missing or empty
  if (!students || !Array.isArray(students) || students.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 dark:border-white/5 dark:bg-[#2a2f42]/30">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">No student progress data yet.</p>
      </div>
    );
  }

  return (
    // Display the student cards in a responsive grid
    <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* Create one StudentCard component for every student */}
      {students.map((student) => (
        <StudentCard 
          key={student.progressId || student._id || Math.random()} 
          student={student} 
          onViewAnalytics={onViewAnalytics} 
          onViewChat={onViewChat}
        />
      ))}
    </div>
  );
}

// Export the component so it can be used in other files
export default StudentList;