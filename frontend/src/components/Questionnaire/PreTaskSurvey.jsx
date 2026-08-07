// Import React state management
import { useState } from "react";

// Import the service used to submit the pre-task questionnaire
import { submitPreTask } from "../../services/questionnaireService";

// Import the session context to access the current student's information
import { useSession } from "../../Context/SessionContext";

// Store the 27 systems-thinking assessment statements
const likertQuestions = [
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

// Display and manage the pre-task questionnaire
function PreTaskSurvey({ onDone, allowSkip }) {
  // Get the active student's session information
  const { sessionInfo } = useSession();

  // Store all questionnaire values in one form object
  const [form, setForm] = useState({
    consent: "",
    gender: "",
    age: "",
    education: "",
    workedInSE: "",
    roleAndExperience: "",
    studiedSE: "",
    usedSocraticBot: "",
    socraticBotExperience: "",
    openQ1: "",
    openQ2: "",
    likertAnswers: {}
  });

  // Store a validation or submission error message
  const [error, setError] = useState("");

  // Update a regular form field based on its input name
  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  // Update one answer in the systems-thinking assessment
  function handleLikertChange(index, value) {
    setForm({
      ...form,
      likertAnswers: {
        ...form.likertAnswers,
        [index]: value,
      },
    });
  }

  // Validate and submit the completed pre-task questionnaire
  async function handleSubmit(e) {
    // Prevent the browser from refreshing the page
    e.preventDefault();

    // Clear any previous error message
    setError("");

    // Require the student to agree to participate
    if (form.consent !== "מסכים/ה להשתתף") {
      setError("עליך להסכים לתנאי ההשתתפות כדי להמשיך.");
      return;
    }

    // Require answers for all 27 systems-thinking questions
    if (Object.keys(form.likertAnswers).length !== likertQuestions.length) {
      setError("אנא ודא/י שענית על כל שאלות ההערכה (סולם 1-5).");
      return;
    }

    try {
      // Send the student ID and questionnaire answers to the backend
      await submitPreTask({
        studentId: sessionInfo.userId,
        ...form,
      });

      // Continue to the next stage after a successful submission
      onDone();
    } catch (err) {
      // Display an error when the request fails
      setError("שגיאה בשליחת השאלון. אנא נסה/י שוב.");
      console.error(err);
    }
  }

  // Reusable component for displaying one radio-button option
  const RadioOption = ({ name, value, label }) => (
    <label className="flex cursor-pointer items-center gap-3 text-slate-700 transition-colors hover:text-slate-900 dark:text-slate-200 dark:hover:text-white">
      <input
        type="radio"
        name={name}
        value={value}
        checked={form[name] === value}
        onChange={handleChange}
        className="h-5 w-5 accent-purple-600 dark:accent-purple-500"
        required
      />
      <span>{label}</span>
    </label>
  );

  return (
    <div className="relative w-full">
      
      {/* FIXED BACKGROUND LAYER: Themed for both Light and Dark modes */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        {/* Purple animated background decoration */}
        <div className="absolute -left-40 top-[-10%] h-[600px] w-[600px] animate-pulse rounded-full bg-purple-300/30 blur-[120px] dark:bg-purple-700/20"></div>

        {/* Indigo animated background decoration */}
        <div 
          className="absolute bottom-[-10%] right-[-10%] h-[700px] w-[700px] animate-pulse rounded-full bg-indigo-300/30 blur-[120px] dark:bg-indigo-700/20" 
          style={{ animationDuration: '4s' }}
        ></div>

        {/* Fuchsia animated background decoration */}
        <div 
          className="absolute left-[30%] top-[40%] h-[400px] w-[400px] animate-pulse rounded-full bg-fuchsia-300/20 blur-[120px] dark:bg-fuchsia-600/10" 
          style={{ animationDuration: '6s' }}
        ></div>
      </div>
      {/* ----------------------------- */}

      {/* Main Content */}
      <div dir="rtl" className="relative z-10 mx-auto max-w-4xl px-4 pb-10 pt-8">
        {/* Questionnaire title and instructions */}
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">שאלון טרום-משימה</h2>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            אנא ענה/י על השאלות הבאות לפני תחילת העבודה עם הצ'אט-בוט
          </p>
        </div>

        {/* Submit the complete questionnaire through handleSubmit */}
        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
          
          {/* General information and research consent section */}
          <section className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-xl backdrop-blur-xl sm:p-6 md:p-8 dark:border-white/5 dark:bg-[#1e2333]/80 dark:shadow-2xl">
            <h3 className="mb-6 text-xl font-bold text-slate-900 dark:text-white">פרטים כלליים והסכמה</h3>
            
            <div className="space-y-6">
              {/* Research participation consent */}
              <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-transparent dark:bg-[#2a2f42]/40">
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  אני מצהיר/ה בזאת שגילי לפחות 18 שנה, קראתי והבנתי את האמור לעיל, אני מעוניין/ת להשתתף במחקר זה:
                </p>

                <div className="flex flex-col gap-3 md:flex-row md:gap-8">
                  <RadioOption name="consent" value="מסכים/ה להשתתף" label="מסכים/ה להשתתף" />
                  <RadioOption name="consent" value="לא מסכים/ה להשתתף" label="לא מסכים/ה להשתתף" />
                </div>
              </div>

              {/* Gender and age fields */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-3">
                  <label className="block font-semibold text-slate-800 dark:text-slate-200">מגדר *</label>

                  <div className="flex flex-col gap-2">
                    <RadioOption name="gender" value="זכר" label="זכר" />
                    <RadioOption name="gender" value="נקבה" label="נקבה" />
                    <RadioOption name="gender" value="אחר" label="אחר" />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block font-semibold text-slate-800 dark:text-slate-200">גיל *</label>

                  <div className="flex flex-col gap-2">
                    <RadioOption name="age" value="18-25" label="18-25" />
                    <RadioOption name="age" value="26-30" label="26-30" />
                    <RadioOption name="age" value="31-40" label="31-40" />
                    <RadioOption name="age" value="מעל 40" label="מעל 40" />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Education and systems-engineering experience section */}
          <section className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-xl backdrop-blur-xl sm:p-6 md:p-8 dark:border-white/5 dark:bg-[#1e2333]/80 dark:shadow-2xl">
            <h3 className="mb-6 text-xl font-bold text-slate-900 dark:text-white">השכלה וניסיון תעסוקתי</h3>
            
            <div className="space-y-6">
              {/* Optional education information */}
              <div>
                <label className="mb-2 block font-semibold text-slate-800 dark:text-slate-200">
                  במידה ויש לך תואר הנדסאי, תואר אקדמי או תואר כלשהו אחר, אנא ציין/י באיזה תחום
                </label>

                <input
                  name="education"
                  value={form.education}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 p-3.5 text-slate-900 transition-all focus:border-purple-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-purple-500 dark:border-transparent dark:bg-[#2a2f42]/80 dark:text-white dark:focus:bg-[#2a2f42]"
                  placeholder="הכנס/י טקסט כאן..."
                />
              </div>

              {/* Previous work experience in systems engineering */}
              <div className="space-y-3">
                <label className="block font-semibold text-slate-800 dark:text-slate-200">
                  האם הינך עובד/ת או עבדת בעבר בתחום הנדסת מערכות? *
                </label>

                <div className="flex gap-8">
                  <RadioOption name="workedInSE" value="כן" label="כן" />
                  <RadioOption name="workedInSE" value="לא" label="לא" />
                </div>
              </div>

              {/* Display the role and experience field only when the student answered yes */}
              {form.workedInSE === "כן" && (
                <div>
                  <label className="mb-2 block font-semibold text-purple-600 dark:text-purple-300">
                    במידה וכן, נא ציין/י מהו התפקיד ומספר שנות ניסיון
                  </label>

                  <input
                    name="roleAndExperience"
                    value={form.roleAndExperience}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 p-3.5 text-slate-900 transition-all focus:border-purple-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-purple-500 dark:border-transparent dark:bg-[#2a2f42]/80 dark:text-white dark:focus:bg-[#2a2f42]"
                    required
                  />
                </div>
              )}

              {/* Previous academic experience in systems engineering */}
              <div className="space-y-3">
                <label className="block font-semibold text-slate-800 dark:text-slate-200">
                  האם הינך לומד/ת או למדת בעבר קורס בתחום הנדסת מערכות או חשיבה מערכתית? *
                </label>

                <div className="flex gap-8">
                  <RadioOption name="studiedSE" value="כן" label="כן" />
                  <RadioOption name="studiedSE" value="לא" label="לא" />
                </div>
              </div>
            </div>
          </section>

          {/* Previous experience with artificial intelligence and Socratic bots */}
          <section className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-xl backdrop-blur-xl sm:p-6 md:p-8 dark:border-white/5 dark:bg-[#1e2333]/80 dark:shadow-2xl">
            <h3 className="mb-6 text-xl font-bold text-slate-900 dark:text-white">ניסיון עם בינה מלאכותית</h3>
            
            <div className="space-y-6">
              {/* Ask whether the student has used a Socratic bot before */}
              <div className="space-y-3">
                <label className="block font-semibold text-slate-800 dark:text-slate-200">
                  האם התנסית בעבר בשימוש בבוט סוקרטי? *
                </label>

                <div className="flex flex-col gap-2">
                  <RadioOption name="usedSocraticBot" value="כן" label="כן" />
                  <RadioOption name="usedSocraticBot" value="לא" label="לא" />
                  <RadioOption name="usedSocraticBot" value="לא בטוח/ה" label="לא בטוח/ה" />
                </div>
              </div>

              {/* Display the experience-level options only when the student answered yes */}
              {form.usedSocraticBot === "כן" && (
                <div className="rounded-lg border border-purple-200 bg-purple-50 p-4 dark:border-purple-500/30 dark:bg-purple-900/10">
                  <label className="mb-3 block font-semibold text-purple-700 dark:text-purple-300">
                    במידה וכן, מהי מידת ההתנסות הקודמת שלך בשימוש בבוט סוקרטי?
                  </label>

                  <div className="flex flex-col gap-2">
                    <RadioOption name="socraticBotExperience" value="ניסיון מועט" label="ניסיון מועט" />
                    <RadioOption name="socraticBotExperience" value="ניסיון בינוני" label="ניסיון בינוני" />
                    <RadioOption name="socraticBotExperience" value="ניסיון רב" label="ניסיון רב" />
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Systems-thinking self-assessment section */}
          <section className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-xl backdrop-blur-xl sm:p-6 md:p-8 dark:border-white/5 dark:bg-[#1e2333]/80 dark:shadow-2xl">
            <h3 className="mb-2 text-xl font-bold text-slate-900 dark:text-white">חשיבה מערכתית - הערכה אישית</h3>

            <p className="mb-6 text-sm text-slate-600 dark:text-slate-400">
              סמן את מידת ההסכמה שלך לכל אחת מהשאלות הבאות בסולם של 1 (במידה מועטה מאוד) עד 5 (במידה רבה מאוד):
            </p>

            {/* Display all 27 Likert-scale questions */}
            <div className="space-y-4">
              {likertQuestions.map((question, idx) => (
                <div key={idx} className="rounded-lg border border-slate-200 bg-slate-50 p-4 transition-colors hover:bg-slate-100 dark:border-transparent dark:bg-[#2a2f42]/40 dark:hover:bg-[#2a2f42]/60">
                  {/* Display the question number and text */}
                  <p className="mb-4 text-sm font-medium text-slate-800 dark:text-slate-200">{idx + 1}. {question}</p>

                  <div className="flex flex-wrap items-center justify-between gap-2 sm:px-4">
                    <span className="hidden text-xs text-slate-500 sm:block dark:text-slate-400">מועטה מאוד</span>

                    {/* Create one radio button for each value from 1 to 5 */}
                    {[1, 2, 3, 4, 5].map((val) => (
                      <label key={val} className="flex cursor-pointer flex-col items-center gap-1">
                        <span className="text-sm text-slate-600 dark:text-slate-400">{val}</span>

                        <input
                          type="radio"
                          name={`likert-${idx}`}
                          value={val}
                          checked={form.likertAnswers[idx] === String(val)}
                          onChange={(e) => handleLikertChange(idx, e.target.value)}
                          className="h-5 w-5 accent-purple-600 dark:accent-purple-500"
                          required
                        />
                      </label>
                    ))}

                    <span className="hidden text-xs text-slate-500 sm:block dark:text-slate-400">רבה מאוד</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Open-ended questions section */}
          <section className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-xl backdrop-blur-xl sm:p-6 md:p-8 dark:border-white/5 dark:bg-[#1e2333]/80 dark:shadow-2xl">
            <h3 className="mb-6 text-xl font-bold text-slate-900 dark:text-white">שאלות פתוחות</h3>
            
            <div className="space-y-6">
              {/* First open-ended question */}
              <div>
                <label className="mb-2 block font-semibold text-slate-800 dark:text-slate-200">
                  אילו סוגי שאלות את/ה שואל/ת את עצמך כשאת/ה מנסה להבין בעיה? *
                </label>

                <textarea
                  name="openQ1"
                  value={form.openQ1}
                  onChange={handleChange}
                  rows="3"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 p-3.5 text-slate-900 transition-all focus:border-purple-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-purple-500 dark:border-transparent dark:bg-[#2a2f42]/80 dark:text-white dark:focus:bg-[#2a2f42]"
                  required
                />
              </div>

              {/* Second open-ended question */}
              <div>
                <label className="mb-2 block font-semibold text-slate-800 dark:text-slate-200">
                  תאר/י מצב שבו פתרון שבחרת הוביל להיווצרות בעיה נוספת שלא נלקחה בחשבון *
                </label>

                <textarea
                  name="openQ2"
                  value={form.openQ2}
                  onChange={handleChange}
                  rows="4"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 p-3.5 text-slate-900 transition-all focus:border-purple-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-purple-500 dark:border-transparent dark:bg-[#2a2f42]/80 dark:text-white dark:focus:bg-[#2a2f42]"
                  required
                />
              </div>
            </div>
          </section>

          {/* Display a validation or submission error */}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center text-red-600 dark:border-red-500/50 dark:bg-red-500/10 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Submit the questionnaire and start the task */}
          <button
            type="submit"
            className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 py-4 text-lg font-bold text-white shadow-lg shadow-purple-500/20 transition-all hover:scale-[1.01] hover:shadow-purple-500/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-[#1e2333]"
          >
            סיים/י שאלון והתחל/י משימה
          </button>

          {/* Testing-only shortcut: skip the questionnaire and go straight to the chat.
              Shown only when the researcher opened the app with ?dev=1. */}
          {allowSkip && (
            <button
              type="button"
              onClick={onDone}
              className="mt-3 w-full rounded-xl border border-slate-300 bg-slate-100 py-3 text-sm font-semibold text-slate-600 transition-all hover:bg-slate-200 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
            >
              דלג/י על השאלון ועבור/י ישר לצ'אט (מצב בדיקה)
            </button>
          )}
        </form>
      </div>
    </div>
  );
}

// Export the component for use in other files
export default PreTaskSurvey;