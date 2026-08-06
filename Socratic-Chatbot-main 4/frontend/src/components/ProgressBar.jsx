// Import React hooks for loading data and managing component state
import { useEffect, useState } from "react";

// Import the service used to retrieve the available learning layers
import { getLayers } from "../services/layerService";

// Import the session context to access the student's current layer
import { useSession } from "../Context/SessionContext";

// Displays the student's progress through the learning layers
function ProgressBar() {
  // Get the current session information
  const { sessionInfo } = useSession();

  // Store the layers returned by the backend
  const [layers, setLayers] = useState([]);

  // Store an error message if the layers cannot be loaded
  const [error, setError] = useState("");

  // Load the learning layers when the component is first displayed
  useEffect(() => {
    async function loadLayers() {
      try {
        // Request the available layers from the backend
        const data = await getLayers();

        // Save the returned layers in the component state
        setLayers(data);
      } catch {
        // Display an error when the request fails
        setError("Failed to load layers.");
      }
    }

    loadLayers();
  }, []);

  // Get the name of the student's current layer
  const currentLayer = sessionInfo?.currentLayer;

  // Find the position of the current layer in the layers array
  const currentIndex = layers.findIndex(
    (layer) => layer.name === currentLayer
  );

  return (
    <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-md backdrop-blur-xl transition-colors sm:p-5 dark:border-white/5 dark:bg-[#1e2333]/80 dark:shadow-xl">
      {/* Section title */}
      <h2 className="mb-3 text-lg font-bold text-slate-900 sm:mb-4 sm:text-xl dark:text-white">
        Layer Progression
      </h2>

      {/* 
        THE FIX: 
        Mobile -> flex row, overflows horizontally so users can swipe. 
        Desktop (md) -> snaps back to the 4-column grid.
      */}
      <div className="flex w-full snap-x snap-mandatory gap-3 overflow-x-auto pb-2 md:grid md:grid-cols-4 md:overflow-visible md:pb-0">
        {/* Create one progress card for every learning layer */}
        {layers.map((layer, index) => {
          // A layer is completed when it appears before the current layer
          const isCompleted = index < currentIndex;

          // A layer is current when its index matches the current layer index
          const isCurrent = index === currentIndex;

          return (
            <div
              key={layer.name}
              className={`min-w-[160px] flex-shrink-0 snap-start rounded-xl p-3 transition-colors sm:p-4 md:min-w-0 ${
                isCurrent
                  ? "bg-purple-600 text-white shadow-md dark:bg-purple-600/90"
                  : isCompleted
                  ? "bg-emerald-500 text-white shadow-md dark:bg-emerald-600/90"
                  : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
              }`}
            >
              {/* Display the layer name */}
              <p className={`text-sm font-bold sm:text-base ${isCurrent || isCompleted ? "text-white" : "text-slate-800 dark:text-slate-200"}`}>
                {layer.name}
              </p>

              {/* Display the layer description when one is available */}
              {layer.description && (
                <p className={`mt-1 text-[10px] sm:mt-2 sm:text-xs ${isCurrent || isCompleted ? "text-white/80" : "text-slate-500 dark:text-slate-400"}`}>
                  {layer.description}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Display an error message when the layers cannot be loaded */}
      {error && (
        <p className="mt-2 text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}

// Export the component for use in other parts of the application
export default ProgressBar;