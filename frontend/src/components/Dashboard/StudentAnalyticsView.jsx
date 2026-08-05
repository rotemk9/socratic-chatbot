import React from 'react';

// Displays detailed analytics for one selected student
function StudentAnalyticsView({ student, onBack }) {
  // Do not display the view when no student is selected
  if (!student) return null;

  // Stores the 27 systems-thinking assessment questions
  const QUESTIONS_ARRAY = [
    "כאשר מנתחים תהליך כלשהו בארגון, חשוב להתמקד בתהליך עצמו ולא בדרך בה התהליך משתלב עם תהליכים רחבים יותר",
    "כאשר בוחנים תהליך שיפור יש לבדוק כיצד השיפורים ישפיעו על תהליכים אחרים נוספים",
    "כאשר עובדים בצוות אחד הדברים החשובים זה כיצד כל חבר צוות יבצע את תפקידו על הצד הטוב ביותר, בלי קשר לעבודת שותפיו לצוות",
    "בטיפול בנושא מסויים יש להבין עד הפרט הקטן ביותר הקשור בנושא",
    "כאשר עוסקים בתחום מסויים, יש להתמקד בתחום עצמו. אין צורך לעסוק בהבטים כלכליים/ ניהוליים או כל הבט אחר שיושפע מעבודה זו",
    "כאשר עוסקים בתהליך מסויים יש צורך להבין גם את תפקידם של אנשי המקצוע האחרים המעורבים בתהליך",
    "כאשר מציגים תהליך בארגון עדיף לא לעסוק בקשרים ההדדיים וההשפעות ההדדיות בין מרכיבי התהליך לתהליכים אחרים בארגון",
    "כאשר נתקלים בבעיה בעבודה כדאי תחילה לפרק אותה למרכיבים ולפתור אותה בשלבים",
    "רק מנהלי פרויקטים בעולם העסקי חייבים לקחת קורסים בניהול פרויקטים, על שאר המהנדסים לעסוק בתחום התמחותם",
    "עדיף שאת הקשר עם הלקוחות יעשו אלו שזה תפקידם",
    "מנהל פרויקט צריך להיות שותף , לבחון את החלופות השונות לפיתרון ולהמליץ על הפיתרון הנבחר. הוא אינו צריך להתרכז במימוש פיתרון שהומלץ ע\"י האירגון",
    "בבחירת מנהל עדיף לתת דגש ליכולתו המקצועית ופחות ליכולת הניהולית שלו",
    "יש להתפשר ולוותר על הפיתרון הטוב ביותר מבחינת הביצועים למשל משיקולי עלות- תועלת",
    "כאשר נתקלים בבעיה, תחילה להבין את ההקשר שבו היא נוצרה",
    "על מנת להצליח בביצוע תפקיד, חשוב לרכוש ידע גם בנושאים שאינם מתחום ההתמחות העיקרית",
    "על כל אחד להתמחות בתחומו, ריבוי תחומים עלול להוביל לידע שטחי (לדעת מעט על הרבה נושאים)",
    "עדיף שהעוסקים בתחומים האסטרטגיים של האירגון יהיו אלו שזהו תפקידם. אין צורך במעורבות גורמים נוספים באירגון",
    "שינויים קטנים עשויים ליצור תוצאות משמעותיות",
    "כשעובד הוא חלק מפרוייקט הוא מעוניין לדעת איך הוא יראה מספר שנים לאחר השלמתו",
    "בפתרון לבעיה צריך לקחת בחשבון גם שיקולים \"פוליטיים\" וארגוניים",
    "בעת פתרון בעיה כלשהי בתהליך העבודה בארגון אין צורך לפנות לממונים, עמיתים או כפופים לנו בשאלות הבהרה. אם יש צורך במידע- ניתן לחפשו באופן עצמאי",
    "לעיתים מומלץ לבדוק מה עוד אפשר לשפר גם אם משמעות הדבר היא אי עמידה בלוח הזמנים שהוגדר לביצוע המשימה",
    "לעיתים עדיף להעז ולקחת סיכונים",
    "יש להבין כיצד מרכיבים ותהליכים מסוימים בארגון משפיעים על הדרך בה נעשים דברים במרכיבים ובתהליכים אחרים של הארגון",
    "כאשר מציגים מוצר חדש הדרוש לעבודה בפעם הראשונה עדיף לקבל כמה שיותר פרטים והסברים",
    "יש להבין שעמימות היא חלק בלתי נפרד מהמציאות שבה עובדים",
    "כדי להגיע להחלטה יש לבחון בעיה מנקודות מבט שונות"
  ];

  // Reusable progress bar for displaying a scored post-task metric
  const MetricBar = ({ label, value, max = 5, colorClass = "bg-purple-500" }) => (
    <div className="mb-3">
      {/* Displays the metric name and numeric score */}
      <div className="mb-1 flex justify-between text-xs font-medium text-slate-600 dark:text-slate-300">
        <span>{label}</span>
        <span>{value} / {max}</span>
      </div>

      {/* Displays the metric score as a percentage-based progress bar */}
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
        <div 
          className={`h-full rounded-full ${colorClass}`} 
          style={{ width: `${(value / max) * 100}%` }}
        ></div>
      </div>
    </div>
  );

  // Converts a stored date into a readable time
  const formatTime = (dateString) => {
    // Returns a fallback value when no date is available
    if (!dateString) return "N/A";

    const date = new Date(dateString);

    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    // Added overflow-hidden to the main section to enforce strict bounds
    <section className="mt-4 sm:mt-6 w-full max-w-full overflow-hidden rounded-2xl border border-slate-200 bg-white/80 p-4 sm:p-8 shadow-xl backdrop-blur-xl animate-in fade-in duration-300 dark:border-white/5 dark:bg-[#1e2333]/80 dark:shadow-2xl" dir="ltr">
      
      {/* Header with the back button and selected student information */}
      <div className="mb-6 sm:mb-8 flex flex-col items-start gap-4 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between sm:pb-6 dark:border-white/10">
        <div className="w-full min-w-0">
          {/* Returns to the main dashboard */}
          <button 
            onClick={onBack}
            className="mb-4 flex w-fit items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-purple-600 dark:text-slate-400 dark:hover:text-purple-400"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </button>

          {/* Displays the selected student's name */}
          <h2 className="break-words text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Analytics: {student.studentName}
          </h2>

          {/* Displays the student's group and remaining session time */}
          <p className="mt-1 text-sm text-purple-600 dark:text-purple-400">
            {student.group} | Time Remaining: {student.remainingTime}
          </p>
        </div>
      </div>

      {/* Main analytics layout */}
      <div className="grid w-full gap-6 sm:gap-8 lg:grid-cols-2">

        {/* Displays the student's general session performance */}
        <div className="col-span-1 min-w-0 space-y-4 lg:col-span-2">
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
            Session Performance
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {/* Displays the final learning layer reached by the student */}
            <div className="rounded-xl bg-slate-50 p-4 sm:p-6 text-center border border-slate-100 dark:border-transparent dark:bg-[#2a2f42]/40">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Final Layer
              </p>
              <p className="mt-2 text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                {student.currentLayer || "N/A"}
              </p>
            </div>

            {/* Displays the number of hints used by the student */}
            <div className="rounded-xl bg-slate-50 p-4 sm:p-6 text-center border border-slate-100 dark:border-transparent dark:bg-[#2a2f42]/40">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Hints Used
              </p>
              <p className="mt-2 text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                {student.hintsUsed}
              </p>
            </div>

            {/* Displays the student's completion percentage */}
            <div className="rounded-xl bg-slate-50 p-4 sm:p-6 text-center border border-slate-100 dark:border-transparent dark:bg-[#2a2f42]/40">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Completion
              </p>
              <p className="mt-2 text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                {student.progress}%
              </p>
            </div>
          </div>
        </div>

        {/* Displays the student's pre-task questionnaire information */}
        <div className="min-w-0 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-6 dark:border-white/5 dark:bg-[#2a2f42]/40">
          <h3 className="mb-6 text-lg sm:text-xl font-bold text-indigo-600 dark:text-indigo-300">
            Pre-Task Profile
          </h3>

          {student.preTask ? (
            <div className="space-y-6 text-sm text-slate-700 dark:text-slate-200">
              
              {/* Displays demographic and previous experience information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 break-words rounded-lg bg-slate-200/50 p-4 dark:bg-black/20">
                <p>
                  <span className="text-slate-500 dark:text-slate-400">Gender:</span>{" "}
                  {student.preTask.gender || "N/A"}
                </p>

                <p>
                  <span className="text-slate-500 dark:text-slate-400">Age:</span>{" "}
                  {student.preTask.age || "N/A"}
                </p>

                <p className="sm:col-span-2">
                  <span className="text-slate-500 dark:text-slate-400">Education:</span>{" "}
                  {student.preTask.education || "None"}
                </p>

                <p>
                  <span className="text-slate-500 dark:text-slate-400">Studied SE:</span>{" "}
                  {student.preTask.studiedSE || "N/A"}
                </p>

                <p>
                  <span className="text-slate-500 dark:text-slate-400">Worked in SE:</span>{" "}
                  {student.preTask.workedInSE || "N/A"}
                </p>
                
                {/* Displays the student's software-engineering role when provided */}
                {student.preTask.roleAndExperience &&
                  student.preTask.roleAndExperience !== "0" && (
                    <p className="sm:col-span-2">
                      <span className="text-slate-500 dark:text-slate-400">SE Role:</span>{" "}
                      {student.preTask.roleAndExperience}
                    </p>
                  )}
                
                <p>
                  <span className="text-slate-500 dark:text-slate-400">
                    Used Socratic Bot:
                  </span>{" "}
                  {student.preTask.usedSocraticBot || "N/A"}
                </p>
                
                {/* Displays previous Socratic chatbot experience when provided */}
                {student.preTask.socraticBotExperience &&
                  student.preTask.socraticBotExperience !== "0" && (
                    <p className="sm:col-span-2">
                      <span className="text-slate-500 dark:text-slate-400">Bot Exp:</span>{" "}
                      {student.preTask.socraticBotExperience}
                    </p>
                  )}
              </div>

              {/* Displays the 27 pre-task Likert answers when available */}
              {student.preTask.likertAnswers &&
                Object.keys(student.preTask.likertAnswers).length > 0 && (
                  <div className="border-t border-slate-200 pt-4 dark:border-white/10">
                    <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Systems Thinking Assessment (27 Questions)
                    </p>
                    
                    <div className="flex flex-col gap-3 rounded-lg bg-slate-200/50 p-4 dark:bg-black/20">
                      {Object.entries(student.preTask.likertAnswers).map(
                        ([qKey, answer]) => {
                          // Converts the stored answer key into the matching question index
                          const qIndex = parseInt(qKey, 10);
                          const questionText = QUESTIONS_ARRAY[qIndex];

                          return (
                            <div
                              key={qKey}
                              className="flex items-start justify-between gap-3 border-b border-slate-200 pb-3 dark:border-white/5"
                              dir="rtl"
                            >
                              {/* Displays the questionnaire statement */}
                              <span className="flex-1 min-w-0 break-words text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                                {questionText
                                  ? questionText
                                  : `Question text missing for index: ${qIndex}`}
                              </span>

                              {/* Displays the student's answer score */}
                              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-indigo-100 text-sm font-bold text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">
                                {answer}
                              </span>
                            </div>
                          );
                        }
                      )}
                    </div>
                  </div>
                )}

              {/* Displays the student's open-ended pre-task answers */}
              <div className="space-y-4 border-t border-slate-200 pt-4 dark:border-white/10">
                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400" dir="rtl">
                    אילו סוגי שאלות את/ה שואל/ת את עצמך כשאת/ה מנסה להבין בעיה?
                  </p>

                  <p className="break-words rounded-lg bg-slate-200/50 p-4 text-sm italic leading-relaxed text-slate-700 dark:bg-black/20 dark:text-slate-300" dir="rtl">
                    {student.preTask.openQ1
                      ? `"${student.preTask.openQ1}"`
                      : "No answer provided"}
                  </p>
                </div>

                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400" dir="rtl">
                    תאר/י מצב שבו פתרון שבחרת הוביל להיווצרות בעיה נוספת
                  </p>

                  <p className="break-words rounded-lg bg-slate-200/50 p-4 text-sm italic leading-relaxed text-slate-700 dark:bg-black/20 dark:text-slate-300" dir="rtl">
                    {student.preTask.openQ2
                      ? `"${student.preTask.openQ2}"`
                      : "No answer provided"}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            // Displays an empty state when the pre-task questionnaire is unavailable
            <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-100 dark:border-white/10 dark:bg-black/10">
              <p className="text-slate-500">Not completed yet</p>
            </div>
          )}
        </div>

        {/* Displays the student's post-task questionnaire metrics */}
        <div className="min-w-0 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-6 dark:border-white/5 dark:bg-[#2a2f42]/40">
          <h3 className="mb-6 text-lg sm:text-xl font-bold text-green-600 dark:text-green-300">
            Post-Task Metrics
          </h3>

          {student.postTask ? (
            <div className="space-y-6">
              {/* Displays the three main post-task ratings */}
              <div>
                <MetricBar
                  label="Perceived Effort"
                  value={student.postTask.perceivedEffort}
                  colorClass="bg-red-400"
                />

                <MetricBar
                  label="Satisfaction"
                  value={student.postTask.satisfaction}
                  colorClass="bg-green-400"
                />

                <MetricBar
                  label="Questions Helped Thinking"
                  value={student.postTask.didQuestionsHelpThinking}
                  colorClass="bg-blue-400"
                />
              </div>
              
              {/* Displays the 27 post-task Likert answers when available */}
              {student.postTask.likertAnswers &&
                Object.keys(student.postTask.likertAnswers).length > 0 && (
                  <div className="border-t border-slate-200 pt-4 mt-4 dark:border-white/10">
                    <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Systems Thinking Assessment (27 Questions - Post-Task)
                    </p>
                    
                    <div className="flex flex-col gap-3 rounded-lg bg-slate-200/50 p-4 dark:bg-black/20">
                      {Object.entries(student.postTask.likertAnswers).map(
                        ([qKey, answer]) => {
                          // Converts the stored answer key into the matching question index
                          const qIndex = parseInt(qKey, 10);
                          const questionText = QUESTIONS_ARRAY[qIndex];

                          return (
                            <div
                              key={qKey}
                              className="flex items-start justify-between gap-3 border-b border-slate-200 pb-3 dark:border-white/5"
                              dir="rtl"
                            >
                              {/* Displays the questionnaire statement */}
                              <span className="flex-1 min-w-0 break-words text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                                {questionText
                                  ? questionText
                                  : `Question text missing for index: ${qIndex}`}
                              </span>

                              {/* Displays the student's post-task answer score */}
                              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-green-100 text-sm font-bold text-green-600 dark:bg-green-500/20 dark:text-green-400">
                                {answer}
                              </span>
                            </div>
                          );
                        }
                      )}
                    </div>
                  </div>
                )}

              {/* Displays the manipulation check for experimental-group students */}
              {student.group === "Experimental Group" && (
                <div className="rounded-lg border border-slate-200 bg-slate-100 p-4 mt-4 dark:border-white/5 dark:bg-black/20">
                  <p className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Manipulation Check Failed?
                  </p>

                  <p
                    className={`text-lg font-bold ${
                      student.postTask.didBotGiveAnswers
                        ? "text-red-500 dark:text-red-400"
                        : "text-green-600 dark:text-green-400"
                    }`}
                  >
                    {student.postTask.didBotGiveAnswers
                      ? "YES (Bot gave direct answers)"
                      : "NO (Valid data)"}
                  </p>
                </div>
              )}

              {/* Displays the student's written feedback */}
              <div className="border-t border-slate-200 pt-4 dark:border-white/10">
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Student Feedback
                </p>

                <p className="break-words min-h-[100px] rounded-lg bg-slate-200/50 p-4 text-sm italic leading-relaxed text-slate-700 dark:bg-black/20 dark:text-slate-300" dir="rtl">
                  {student.postTask.feedback
                    ? `"${student.postTask.feedback}"`
                    : "No feedback provided."}
                </p>
              </div>
            </div>
          ) : (
            // Displays an empty state when the post-task questionnaire is unavailable
            <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-100 dark:border-white/10 dark:bg-black/10">
              <p className="text-slate-500">Not completed yet</p>
            </div>
          )}
        </div>
        
        {/* Displays a chronological record of unlocked gates */}
        <div className="col-span-1 min-w-0 lg:col-span-2 mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-6 dark:border-white/5 dark:bg-[#2a2f42]/40">
          <h3 className="mb-4 text-lg sm:text-xl font-bold text-emerald-600 dark:text-emerald-400">
            Gate Unlocks & Triggers
          </h3>

          <p className="mb-6 text-sm text-slate-600 dark:text-slate-400">
            A chronological log of when this student unlocked each AI gate and the exact reasoning they provided.
          </p>
          
          {/* Contains the gate events table inside a scrollable area */}
          <div className="w-full max-w-full overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-white/10 dark:bg-[#1e2333]/50">
            <div className="max-h-96 w-full overflow-auto p-1">
              <table className="w-full min-w-[600px] text-left text-sm text-slate-700 dark:text-slate-300">
                {/* Displays the table column titles */}
                <thead className="sticky top-0 bg-slate-100 text-xs uppercase tracking-wider text-slate-500 shadow-sm z-10 dark:bg-[#1e2333] dark:text-slate-400">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Time</th>
                    <th className="px-4 py-3 font-semibold">Layer</th>
                    <th className="px-4 py-3 font-semibold">Gate Unlocked</th>
                    <th className="px-4 py-3 font-semibold w-1/2">
                      Triggering Message
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {/* Displays gate events or an empty-state message */}
                  {student.gateEvents && student.gateEvents.length > 0 ? (
                    student.gateEvents.map((gate, idx) => (
                      <tr
                        key={idx}
                        className="transition-colors hover:bg-slate-50 dark:hover:bg-white/5"
                      >
                        {/* Displays the time when the gate was unlocked */}
                        <td className="whitespace-nowrap px-4 py-4 text-slate-600 dark:text-slate-400">
                          {formatTime(gate.createdAt)}
                        </td>

                        {/* Displays the learning layer connected to the gate */}
                        <td className="px-4 py-4 text-slate-700 dark:text-slate-300">
                          <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium dark:bg-white/5">
                            {gate.layer}
                          </span>
                        </td>

                        {/* Displays the name of the unlocked gate */}
                        <td className="px-4 py-4 font-semibold text-emerald-600 dark:text-emerald-400">
                          {gate.gateName}
                        </td>

                        {/* Displays the student message that triggered the gate */}
                        <td className="px-4 py-4 italic text-slate-700 dark:text-slate-300" dir="rtl">
                          "{gate.trigger}"
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-4 py-8 text-center text-slate-500">
                        No gates have been unlocked by this student yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

// Exports the component so it can be used in the dashboard
export default StudentAnalyticsView;