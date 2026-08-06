import { useState, useEffect, useRef } from "react";

function CountdownTimer({ startTime, initialMinutes = 20, onTimeUp, onReminder }) {
  
  // 1. Calculate the exact time IMMEDIATELY on the first render to prevent 00:00 stutter
  const [timeLeft, setTimeLeft] = useState(() => {
    if (!startTime) return initialMinutes * 60;
    
    const startTimestamp = new Date(startTime).getTime();
    const durationMs = initialMinutes * 60 * 1000;
    const remainingMs = Math.max(0, startTimestamp + durationMs - Date.now());
    
    return Math.floor(remainingMs / 1000);
  });

  // Refs to ensure we only fire the F-08 reminders exactly once
  const tenMinFired = useRef(false);
  const twoMinFired = useRef(false);

  useEffect(() => {
    if (!startTime) return;

    const startTimestamp = new Date(startTime).getTime();
    const durationMs = initialMinutes * 60 * 1000;
    const endTimestamp = startTimestamp + durationMs;

    const timerId = setInterval(() => {
      const now = Date.now();
      const remainingMs = Math.max(0, endTimestamp - now);
      const remainingSec = Math.floor(remainingMs / 1000);

      setTimeLeft(remainingSec);

      // 1. Check if time is completely up
      if (remainingSec <= 0) {
        clearInterval(timerId);
        if (onTimeUp) onTimeUp();
      } 
      // 2. F-08 Requirement: 10-minute neutral reminder
      // FIX: Only trigger if the time is ACTUALLY between 10:00 and 09:50!
      else if (remainingSec <= 600 && remainingSec > 590 && !tenMinFired.current) {
        if (onReminder) onReminder("נותרו 10 דקות לסיום המשימה.");
        tenMinFired.current = true;
      } 
      // 3. F-08 Requirement: 2-minute neutral reminder
      // FIX: Only trigger if the time is ACTUALLY between 02:00 and 01:50!
      else if (remainingSec <= 120 && remainingSec > 110 && !twoMinFired.current) {
        if (onReminder) onReminder("נותרו 2 דקות לסיום המשימה.");
        twoMinFired.current = true;
      }
    }, 1000);

    // Cleanup interval on unmount
    return () => clearInterval(timerId);
    
  }, [startTime, initialMinutes, onTimeUp, onReminder]); 

  // Format the raw seconds into a clean MM:SS layout
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;

  return (
    <span 
      className={`font-mono text-lg sm:text-xl font-bold tracking-wider transition-colors ${
        timeLeft <= 120 && timeLeft > 0 
          ? "animate-pulse text-red-600 dark:text-red-400" 
          : "text-slate-900 dark:text-white"
      }`}
    >
      {formattedTime}
    </span>
  );
}

export default CountdownTimer;