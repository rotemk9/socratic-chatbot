// Displays a reusable information card with a title and value
function InfoCard({ title, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 transition-colors sm:p-4 dark:border-white/5 dark:bg-slate-900/50">
      {/* Display the information label */}
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 sm:text-xs dark:text-slate-400">
        {title}
      </p>

      {/* Display the information value */}
      <p className="mt-0.5 text-sm font-bold text-slate-900 sm:mt-1 sm:text-lg dark:text-white">
        {value}
      </p>
    </div>
  );
}

// Export the component for use in other files
export default InfoCard;