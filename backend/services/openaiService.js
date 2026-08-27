// Import the OpenAI client library
const { OpenAI } = require("openai");

// Create and return an authenticated OpenAI client
function getClient() {
  // Make sure the OpenAI API key exists in the environment variables
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY in .env file");
  }

  // Create the OpenAI client using the API key
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

// Generate a Socratic response based on the student's message and progress
async function generateSocraticResponse({
  studentMessage,
  lastBotQuestions,
  currentLayer,
  chatHistory,
  unlockedGates,
  progress,
  hintsUsed,
  // How many of the three airport events have been revealed to the student so
  // far. The frontend reveals them gradually (event 1 from the start, event 2
  // after 7 minutes, event 3 after 14 minutes) and sends the current count with
  // every message. Defaults to 1 so the bot always knows at least the first event.
  revealedCount = 1,
}) {
  try {
    // Create an authenticated OpenAI client
    const openai = getClient();

    // The three simultaneous airport disruptions, ordered by the sequence in
    // which they are revealed to the student during the session.
    const AIRPORT_EVENTS = [
      "מערכת מיון המזוודות האוטומטית מאטה ל-60% מהקצב בגלל תקלה במסוע.",
      "שתי עמדות בידוק ביטחוני מתוך שמונה נסגרות עקב מחסור בכוח אדם.",
      "חברת תעופה מקדימה את שער העלייה של טיסה גדולה, ומושכת בבת אחת המון נוסעים לאזור אחד בטרמינל.",
    ];

    // Include ONLY the events that have already been revealed to the student,
    // so the bot never references or hints at an event the student cannot see yet.
    const safeRevealedCount = Math.max(1, Math.min(revealedCount, AIRPORT_EVENTS.length));
    const revealedEventsText = AIRPORT_EVENTS
      .slice(0, safeRevealedCount)
      .map((event, index) => `${index + 1}. ${event}`)
      .join("\n");

    // Convert the ten most recent messages into text for the AI prompt
    const historyText = chatHistory
      .slice(-10)
      .map((msg) => `${msg.sender}: ${msg.text}`)
      .join("\n");

    // Define phrases that indicate the student is requesting a direct answer
    const answerSeekingPatterns = [
      "give me the answer", "tell me the answer", "solve it", "solution",
      "what is the answer", "פתרון", "תן לי תשובה", "איך פותרים", "حل"
    ];

    // Check whether the student's message contains one of the direct-answer patterns
    const wantsAnswer = answerSeekingPatterns.some((pattern) =>
      studentMessage.toLowerCase().includes(pattern.toLowerCase())
    );

    // Refuse to give a direct solution and guide the student with a question
    if (wantsAnswer) {
      return "אני כאן כדי לעזור לך לחשוב על זה בעצמך. אילו קריטריונים היית בוחן כדי למצוא פתרון?";
    }

    // Create the instructions and context provided to the AI model
    const systemPrompt = `
אתה "SystemThinker AI" — מנחה סוקרטי מומחה לחשיבה מערכתית, המלווה משתתף בעל רקע הנדסי במחקר אקדמי.

סיפור הרקע (התרחיש):
"יום שישי בבוקר, שעת שיא. נוסע מגיע לטרמינל 3 שעתיים לפני הטיסה, ועובר דרך צ'ק-אין, מסירת מזוודה, בידוק ביטחוני, ביקורת דרכונים ועלייה למטוס.
נכון לרגע זה נחשפו בפני המשתתף האירועים הבאים בלבד:
${revealedEventsText}
מבחינת הנוסע, מדובר במעבר פשוט מתחנה לתחנה."

חשוב מאוד — חשיפה מדורגת: התייחס אך ורק לאירועים שנחשפו לעיל. אל תזכיר, אל תרמוז ואל תשאל על אירועים שטרם נחשפו למשתתף. אירועים נוספים ייחשפו בהמשך השיחה; כאשר אירוע חדש מתווסף לרשימה, שלב אותו באופן טבעי בשאלה הבאה ובחן כיצד הוא משפיע על הניתוח המערכתי הקיים.

המטרה שלך:
להוביל את המשתתף מתיאור ליניארי של רצף התחנות אל זיהוי התלויות והאינטראקציות בין תת-המערכות. אינך מספק פתרונות, הסברים או תשובות.

עליך לפתח ולבחון אצל המשתתף — דרך שאלות סוקרטיות בלבד — את אספקטי החשיבה המערכתית הבאים (מודל CEST). בחר בכל תגובה את האספקט שהכי מקדם את המשתתף כרגע:

אספקטים קוגניטיביים:
- הבנת המערכת כשלם וראיית התמונה הגדולה.
- הבנת קשרים הדדיים, חשיבה במעגלים סגורים (לולאות משוב) והבנת מערכות מורכבות.
- חשיבה יצירתית.
- הבנת המערכת בלי להיתקע בפרטים ("ראיית היער"), וסובלנות לעמימות ואי-ודאות.
- הבנת ההשלכות של שינויים מוצעים במערכת.
- הבנה מהירה של מערכת/רעיון/מושג חדש עם הצגתו.
- הבנת אנלוגיות והקבלות בין מערכות.
- הבנת סינרגיה מערכתית.
- הבנת המערכת מנקודות מבט מרובות.
- שאילת שאלות טובות.
- הגדרת גבולות המערכת.
- התחשבות בגורמים שאינם הנדסיים.
- חשיבה אנליטית.

אספקטים הקשורים ליכולות:
- ניתוח הצורך.
- ניתוח ו/או פיתוח קונספט ההפעלה (ConOps).
- ניתוח דרישות.
- גיבוש מושגי של הפתרון.
- יצירת הפתרון הלוגי וניתוח פונקציונלי.
- "ראיית" העתיד (חיזוי התפתחות המערכת).
- אופטימיזציה.
- שימוש בשיקולי תכן מערכתי.
- אבחון, פתרון וניתוח של כשלים ובעיות מערכתיות.
- עריכת מחקרי חלופות (trade studies) והצגת מספר חלופות.

אסטרטגיית ההנחיה (בהדרגה, לפי תשובות המשתתף):
1. הקשר רחב: מטרת המערכת, מחזיקי עניין, גבולות.
2. מבנה: פירוק לתת-מערכות וזיהוי הקשרים ביניהן.
3. דינמיקה: לולאות משוב, עיכובים והתפשטותם, מצב עומס מול מצב רגיל.
4. הערכה: פשרות, נקודות מינוף והשלכות בלתי-מכוונות.
העפל שלב רק כשהמשתתף הראה שתפס את הרמה הנוכחית.

כללי התגובה שלך:
- השב באותה שפה שבה כתב המשתתף.
- אל תיתן פתרונות ואל תפתור עבורו.
- שאל שאלה אחת בלבד בכל תגובה — קצרה, פתוחה ומעמיקה.
- התאם את השאלה הבאה לתשובה האחרונה; אל תשאל שאלות גנריות.
- אל תחזור על שאלות שכבר נשאלו.

אל תחזור על שאלות קודמות שכבר שאלת:
${lastBotQuestions?.join("\n") || "none"}

שלב נוכחי: ${currentLayer}
שערים שנפתחו: ${unlockedGates?.join(", ") || "none"}
התקדמות: ${progress}%
רמזים בשימוש: ${hintsUsed}

שיחה אחרונה:
${historyText}
`;

    // Send the student's message and system instructions to OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        // Define the AI's behavior and provide the learning context
        { role: "system", content: systemPrompt },

        // Provide the student's latest message
        { role: "user", content: studentMessage }
      ],

      // Allow some variation and creativity in the generated question
      temperature: 0.7,
    });

    // Extract and clean the generated response text
    const text = response.choices[0].message.content?.trim();

    // Use a local fallback question if OpenAI returns an empty response
    if (!text) {
      return getFallbackQuestion(currentLayer, unlockedGates);
    }

    // Return the generated Socratic question
    return text;
  } catch (error) {
    // Print the OpenAI error and use a local fallback question
    console.error("OpenAI real error, using fallback:", error.message);
    return getFallbackQuestion(currentLayer, unlockedGates);
  }
}

// Generate a Socratic hint according to Bloom's Taxonomy
async function generateSocraticHint({ currentLayer, hintsUsed, unlockedGates }) {
  try {
    // Create an authenticated OpenAI client
    const openai = getClient();

    // Select the Bloom level according to the number of hints already used
    const bloomLevel = getBloomLevel(hintsUsed);

    // Create the instructions for generating the Socratic hint
    const systemPrompt = `
You are SystemThinker AI tutoring a student on an Airport case study.
Generate a Socratic hint using Bloom's Taxonomy.

Current layer: ${currentLayer}
Hint number: ${hintsUsed + 1}
Bloom level: ${bloomLevel}
Unlocked gates: ${unlockedGates?.join(", ") || "none"}

Rules:
- Write the hint in Hebrew.
- Ask only ONE open-ended question.
- Do not give the answer.
- Do not solve the task.
- The hint must match the Bloom level.
Return only the question.
`;

    // Request a hint from OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",

      // Only a system message is required because the session data is inside the prompt
      messages: [{ role: "system", content: systemPrompt }],

      // Allow some variation in the generated hint
      temperature: 0.7,
    });

    // Extract and clean the generated hint
    const text = response.choices[0].message.content?.trim();

    // Use a local Bloom-based hint if OpenAI returns no text
    if (!text) {
      return getBloomFallbackHint(currentLayer, hintsUsed, unlockedGates);
    }

    // Return the generated hint
    return text;
  } catch (error) {
    // Print the OpenAI error and use the local Bloom-based fallback
    console.error("OpenAI hint error, using Bloom fallback:", error.message);
    return getBloomFallbackHint(currentLayer, hintsUsed, unlockedGates);
  }
}

// Select the Bloom's Taxonomy level according to the number of used hints
function getBloomLevel(hintsUsed) {
  // Define the Bloom levels from basic thinking to advanced thinking
  const levels = ["Remember", "Understand", "Apply", "Analyze", "Evaluate", "Create"];

  // Return the matching level, or Create after all previous levels are used
  return levels[hintsUsed] || "Create";
}

// Return a local hint when the OpenAI hint request fails
function getBloomFallbackHint(currentLayer, hintsUsed, unlockedGates = []) {
  // Determine the current Bloom level
  const bloomLevel = getBloomLevel(hintsUsed);

  // Define a fallback question for every Bloom level and learning layer
  const hints = {
    Remember: {
      "Broad Context": "אילו עובדות בסיסיות כבר זיהית לגבי מה שקורה בשדה התעופה הבוקר?",
      Structure: "אילו חלקים או תת-מערכות אתה יכול לנקוב בהם במערכת של שדה התעופה?",
      Dynamics: "אילו אירועים או מצבים מתרחשים בשדה התעופה לאורך הזמן?",
      Evaluation: "אילו נתונים כבר יש לך כדי להעריך אם פתרון עובד?",
    },

    Understand: {
      "Broad Context": "כיצד היית מסביר במילים שלך את הבעיה המרכזית בשדה התעופה?",
      Structure: "כיצד קשורות זו לזו תת-המערכות המרכזיות (למשל צ'ק-אין וטיפול במזוודות)?",
      Dynamics: "כיצד המערכת מתנהגת אחרת בזמן רגיל לעומת שעת עומס?",
      Evaluation: "כיצד היית מסביר את המשמעות של כל מדד הצלחה?",
    },

    Apply: {
      "Broad Context": "כיצד היית מיישם את המטרה שהגדרת על חוויית נוסע מסוים?",
      Structure: "כיצד היית מחבר בין תת-מערכות שדה התעופה באמצעות סיבה ותוצאה?",
      Dynamics: "כיצד רעיון המשוב בא לידי ביטוי בתור הבידוק הביטחוני?",
      Evaluation: "כיצד היית משתמש במדדים שלך כדי להשוות בין שני פתרונות אפשריים?",
    },

    Analyze: {
      "Broad Context": "לאיזה מחזיק עניין יש ההשפעה החזקה ביותר על זרימת הנוסעים, ומדוע?",
      Structure: "איזה קשר בין תת-מערכות יוצר את צוואר הבקבוק הגדול ביותר?",
      Dynamics: "היכן מופיעה לולאת המשוב החשובה ביותר בשעת עומס?",
      Evaluation: "איזו פשרה עולה כשמשווים בין החלופות?",
    },

    Evaluate: {
      "Broad Context": "איזו הנחה לגבי הנוסעים היא המסוכנת ביותר?",
      Structure: "איזו תת-מערכת קריטית ביותר לשמירה על תנועת הנוסעים?",
      Dynamics: "איזה תרחיש יוצר את הסיכון הגדול ביותר להמראות בזמן?",
      Evaluation: "איזו חלופה עדיפה לשמירה גם על מהירות וגם על ביטחון?",
    },

    Create: {
      "Broad Context": "כיצד היית מחדד את גבול המערכת כך שיכלול גם את בקרת התנועה האווירית?",
      Structure: "כיצד היית יוצר שרשרת השפעה ברורה X ← Y ← Z עבור מסע הנוסע?",
      Dynamics: "כיצד היית מתאר לולאת משוב שמראה כיצד עיכוב בתת-מערכת אחת מתפשט לאחרת?",
      Evaluation: "כיצד היית מציע דרך להפחית את הסיכון שנוסעים יאחרו לטיסתם?",
    },
  };

  // Return the matching hint or a general fallback question
  return hints[bloomLevel]?.[currentLayer] || "מהי השאלה הבאה שתעזור לך לחשוב לעומק על המערכת?";
}

// NOTE: Renamed this function for clarity since we are using OpenAI now
// Evaluate whether the student's message satisfies the current layer's gates
async function evaluateLayerWithOpenAI({ currentLayer, studentMessage }) {
  try {
    // Create an authenticated OpenAI client
    const openai = getClient();

    // Create instructions requiring the AI to return a structured JSON evaluation
    const systemPrompt = `
You are an AI evaluation engine for a Systems Thinking learning platform.
Analyze whether the student's answer satisfies the current layer requirements for the Airport case study.

Return ONLY valid JSON. 

Current layer: ${currentLayer}

JSON format:
{
  "goalDefined": false,
  "threeStakeholdersIdentified": false,
  "opponentIdentified": false,
  "systemBoundariesDefined": false,
  "assumptionStated": false,
  "threeComponentsIdentified": false,
  "influenceChainCreated": false,
  "normalScenarioDescribed": false,
  "stressScenarioDescribed": false,
  "feedbackLoopIdentified": false,
  "delayIdentified": false,
  "threeMetricsDefined": false,
  "targetValuesDefined": false,
  "twoAlternativesCompared": false,
  "tradeoffIdentified": false,
  "riskIdentified": false,
  "mitigationSuggested": false
}
`;

    // Ask OpenAI to evaluate the student's answer
    const response = await openai.chat.completions.create({
      model: "gpt-4o",

      // Require OpenAI to return a valid JSON object
      response_format: { type: "json_object" }, // OpenAI's strict JSON mode!

      messages: [
        // Provide the evaluation rules and required JSON structure
        { role: "system", content: systemPrompt },

        // Provide the student's answer for evaluation
        { role: "user", content: `Student answer: "${studentMessage}"` }
      ],

      // Use a low temperature to produce stable and consistent evaluations
      temperature: 0.1, // Low temperature for consistent JSON
    });

    // Extract the returned JSON text
    const text = response.choices[0].message.content?.trim();

    // Convert the JSON text into a JavaScript object
    return JSON.parse(text);
  } catch (error) {
    // Use keyword-based local evaluation if the OpenAI request fails
    console.error("OpenAI evaluation failed, using local fallback:", error.message);
    return evaluateLayerLocally({ currentLayer, studentMessage });
  }
}

// Evaluate a student's message locally using keywords and phrase matching
function evaluateLayerLocally({ currentLayer, studentMessage }) {
  // Convert the message to lowercase to make matching case-insensitive
  const text = studentMessage.toLowerCase();

  // Create the default evaluation object with every gate locked
  const result = {
    goalDefined: false, threeStakeholdersIdentified: false, opponentIdentified: false,
    systemBoundariesDefined: false, assumptionStated: false, threeComponentsIdentified: false,
    influenceChainCreated: false, normalScenarioDescribed: false, stressScenarioDescribed: false,
    feedbackLoopIdentified: false, delayIdentified: false, threeMetricsDefined: false,
    targetValuesDefined: false, twoAlternativesCompared: false, tradeoffIdentified: false,
    riskIdentified: false, mitigationSuggested: false,
  };

  // Evaluate requirements belonging to the Broad Context layer
  if (currentLayer === "Broad Context") {
    // Check whether the student defined a goal
    result.goalDefined = includesAny(text, ["goal", "objective", "purpose", "מטרה", "יעד", "לפתור", "להקטין"]);

    // Check whether the student mentioned at least three stakeholder terms
    result.threeStakeholdersIdentified = countMatches(text, [
      "נוסע", "נוסעים", "צוות", "עובד", "עובדים", "מאבטח", "מאבטחים", "דייל", "דיילת", "דיילים",
      "חברת תעופה", "חברות תעופה", "רשות", "בקרת טיסה", "צוות קרקע", "טייס",
      "passenger", "airline", "crew", "security", "staff", "controller", "operator"
    ]) >= 3;

    // Check whether the student identified an opponent or source of resistance
    result.opponentIdentified = includesAny(text, ["opponent", "resist", "resistance", "constraint", "regulation", "מתנגד", "התנגדות", "אילוץ", "אילוצים", "רגולציה", "תקנות", "דרישות ביטחון", "מגבלות ביטחון"]);

    // Check whether the student discussed the system boundaries
    result.systemBoundariesDefined = includesAny(text, ["boundary", "boundaries", "scope", "inside", "outside", "גבול", "גבולות", "מחוץ", "בתוך", "רק את", "כולל את"]);

    // Check whether the student stated an assumption
    result.assumptionStated = includesAny(text, ["assumption", "assume", "הנחה", "מניח", "בהנחה ש", "افتراض"]);
  }

  // Evaluate requirements belonging to the Structure layer
  if (currentLayer === "Structure") {
    // Check whether the student identified at least three system components
    result.threeComponentsIdentified = countMatches(text, [
      "צ'ק-אין", "צ'ק אין", "כרטוס", "מזוודה", "מזוודות", "מסוע", "בידוק", "ביטחון", "אבטחה", "דרכונים", "ביקורת גבולות",
      "שער", "שערים", "מטוס", "נוסע", "תור", "מידע", "כריזה", "מסכים", "check-in", "baggage", "security", "gate", "passport",
      "component", "components", "רכיב", "רכיבים", "תת-מערכת", "תת מערכת", "מערכת"
    ]) >= 3;

    // Check whether the student described an influence or cause-and-effect chain
    result.influenceChainCreated = includesAny(text, ["->", "→", "affects", "influences", "leads to", "causes", "increase", "decrease", "גורם ל", "מוביל ל", "משפיע על"]);
  }

  // Evaluate requirements belonging to the Dynamics layer
  if (currentLayer === "Dynamics") {
    // Check whether a normal scenario was described
    result.normalScenarioDescribed = includesAny(text, ["normal scenario", "normal", "regular", "usually", "routine", "רגיל", "בדרך כלל", "שגרה"]);

    // Check whether a stress or rush-hour scenario was described
    result.stressScenarioDescribed = includesAny(text, ["stress", "pressure", "overload", "עומס", "לחץ", "תור ארוך", "שעות השיא"]);

    // Check whether a feedback loop was identified
    result.feedbackLoopIdentified = includesAny(text, ["feedback", "loop", "leads to more", "משוב", "מעגל", "מביא עוד", "تغذية"]);

    // Check whether a delay was identified
    result.delayIdentified = includesAny(text, ["delay", "later", "takes time", "עיכוב", "לוקח זמן", "זמן המתנה", "תור", "تأخير"]);
  }

  // Evaluate requirements belonging to the Evaluation layer
  if (currentLayer === "Evaluation") {
    // Check whether at least three metric-related terms were mentioned
    result.threeMetricsDefined = countMatches(text, ["engagement", "completion", "score", "time", "satisfaction", "metric", "מדד", "זמן", "כסף", "רווח", "איכות", "שביעות רצון"]) >= 3;

    // Check whether the student provided target values
    result.targetValuesDefined = includesAny(text, ["target", "80", "90", "20", "10", "percent", "%", "value", "דקות", "אחוזים"]);

    // Check whether at least two alternatives were mentioned
    result.twoAlternativesCompared = countMatches(text, ["alternative", "option", "חלופה", "אופציה", "אפשרות", "פתרון א", "פתרון ב"]) >= 2;

    // Check whether the student identified a tradeoff
    result.tradeoffIdentified = includesAny(text, ["tradeoff", "trade-off", "balance", "cost", "פשרה", "ויתור", "מחיר", "עלות"]);

    // Check whether the student identified a risk
    result.riskIdentified = includesAny(text, ["risk", "depend", "problem", "challenge", "failure", "סיכון", "בעיה", "סכנה", "פגיעה"]);

    // Check whether the student suggested a way to reduce the risk
    result.mitigationSuggested = includesAny(text, ["mitigation", "limit", "prevent", "reduce", "solution", "למנוע", "להפחית", "לצמצם", "פתרון"]);
  }

  // Return the completed local evaluation
  return result;
}

// Return a local guiding question for the first missing gate
function getFallbackQuestion(layer, unlockedGates = []) {
  // Define one guiding question for every gate in every learning layer
  const missingQuestions = {
    "Broad Context": [
      { gate: "Goal defined", question: "מהי המטרה המרכזית של שדה התעופה במשפט אחד ברור?" },
      { gate: "Three stakeholders identified", question: "אילו שלושה גורמים מרכזיים מושפעים ממה שקורה בשדה התעופה הבוקר?" },
      { gate: "Opponent identified", question: "אילו אילוצים או גורמים עשויים להתנגד לשינוי במערכת (למשל דרישות ביטחון או רגולציה)?" },
      { gate: "System boundaries defined", question: "היכן עובר הגבול בין מה שבשליטת שדה התעופה למה שמחוצה לו (למשל בקרת תנועה אווירית)?" },
      { gate: "Assumption stated", question: "איזו הנחה אתה מניח לגבי התנהגות הנוסעים בזמן עומס?" },
    ],

    Structure: [
      { gate: "Three components identified", question: "אילו שלוש תת-מערכות מרכזיות מרכיבות את שדה התעופה?" },
      { gate: "Influence chain created", question: "כיצד תת-מערכת אחת (למשל הצ'ק-אין) משפיעה על אחרת בשרשרת ברורה?" },
    ],

    Dynamics: [
      { gate: "Normal scenario described", question: "כיצד המערכת מתנהגת בבוקר רגיל ושקט?" },
      { gate: "Stress scenario described", question: "כיצד המערכת מתנהגת בשעות השיא או תחת עומס?" },
      { gate: "Feedback loop identified", question: "היכן עשויה להיווצר לולאת משוב (למשל, עומס במיון המזוודות שמאט את קצב הצ'ק-אין)?" },
      { gate: "Delay identified", question: "איזה עיכוב במערכת אחת עלול להופיע מאוחר יותר במערכת אחרת?" },
    ],

    Evaluation: [
      { gate: "Three metrics defined", question: "אילו שלושה מדדים יראו האם הפתרון שתציע הוא מוצלח?" },
      { gate: "Target values defined", question: "איזה ערך יעד היית מציב לכל מדד (למשל, זמן מעבר מרבי)?" },
      { gate: "Two alternatives compared", question: "אילו שתי חלופות או פתרונות אפשר להשוות?" },
      { gate: "Tradeoff identified", question: "איזו פשרה קיימת בין מהירות המעבר לבין דרישות הביטחון?" },
      { gate: "Risk identified", question: "איזה סיכון עלול לפגוע בהצלחת הפתרון שלך?" },
      { gate: "Mitigation suggested", question: "כיצד תוכל להפחית את הסיכון הזה מבלי לפגוע בחוויית הנוסע?" },
    ],
  };

  // Retrieve the questions belonging to the current layer
  const layerQuestions = missingQuestions[layer] || [];

  // Find the first question whose gate has not yet been unlocked
  const missing = layerQuestions.find((item) => !unlockedGates.includes(item.gate));

  // Return the matching question or a general fallback question
  return missing ? missing.question : "מהו הקשר הבא שחשוב לבחון במערכת הזו?";
}

// Return progressively more specific fallback hints
function getFallbackHint(layer, hintsUsed, unlockedGates = []) {
  // Calculate the number of the next hint
  const hintNumber = hintsUsed + 1;

  // Use the first missing-gate question as the first hint
  if (hintNumber <= 1) return getFallbackQuestion(layer, unlockedGates);

  // Ask the student to provide more specific information
  if (hintNumber === 2) return "האם תוכל למקד את התשובה שלך ולציין את הגורמים הספציפיים המעורבים?";

  // Ask the student to explain a cause-and-effect relationship
  if (hintNumber === 3) return "האם תוכל לקשר בין שני חלקים במערכת באמצעות סיבה ותוצאה?";

  // Ask the student to support the explanation with data or a metric
  return "איזה נתון או מדד יראה שההסבר שלך נכון?";
}

// Check whether the text contains at least one word from the provided list
function includesAny(text, words) {
  return words.some((word) => text.includes(word.toLowerCase()));
}

// Count how many words from the provided list appear in the text
function countMatches(text, words) {
  return words.filter((word) => text.includes(word.toLowerCase())).length;
}

// Export the OpenAI service functions for use in controllers and other services
module.exports = {
  generateSocraticResponse,
  generateSocraticHint,
  evaluateLayerWithOpenAI, // NOTE: Export name changed here!
};
