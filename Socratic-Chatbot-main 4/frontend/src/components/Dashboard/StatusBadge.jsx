// Displays a badge with a color based on the provided status
function StatusBadge({ status }) {
  // Determine styles based on status. Fallback to blue.
  const baseStyle = "rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider border backdrop-blur-md transition-colors";
  
  // Light mode default: Blue | Dark mode default: Blue
  let colorStyle = "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300"; 
  
  // Use green styles when the status is completed
  if (status?.toLowerCase() === "completed") {
    colorStyle = "border-green-200 bg-green-50 text-green-700 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-300";
  // Use yellow styles when the student needs support
  } else if (status?.toLowerCase() === "needs support") {
    colorStyle = "border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-500/30 dark:bg-yellow-500/10 dark:text-yellow-300";
  }

  return (
    // Combine the shared badge styles with the selected status color
    <span className={`${baseStyle} ${colorStyle}`}>
      {/* Display the provided status, or Active when no status exists */}
      {status || "Active"}
    </span>
  );
}

// Export the component so it can be used in other files
export default StatusBadge;