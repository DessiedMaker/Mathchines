import { supabase } from "@/integrations/supabase/client";
import { RAW_COUNTRIES } from "./countriesData";

export type Difficulty = "Foundational" | "Standard" | "Challenge";

export interface Question {
  id: string;
  prompt: string;
  choices: string[];
  answerIndex: number;
  difficulty: Difficulty;
  explanation: string;
  examTag?: string;
}

export interface Topic {
  id: string;
  title: string;
  objective: string;
  videoUrl: string;
  workedExamples: { title: string; steps: string[] }[];
  questions: Question[];
}

export interface Grade {
  id: string;
  label: string;
  topics: Topic[];
}

export interface Country {
  code: string;
  name: string;
  flag: string;
  curriculum: string;
  grades: Grade[];
}

const fractionsTopic: Topic = {
  id: "fractions-basics",
  title: "Fractions: Add & Subtract",
  objective: "Add and subtract fractions with like and unlike denominators.",
  videoUrl: "https://www.youtube.com/embed/CoCmsyFQ_Xc",
  workedExamples: [
    {
      title: "Example 1 — Like denominators",
      steps: [
        "Start with 2/7 + 3/7.",
        "Denominators match, so add numerators: 2 + 3 = 5.",
        "Answer: 5/7.",
      ],
    },
    {
      title: "Example 2 — Unlike denominators",
      steps: [
        "Compute 1/3 + 1/4.",
        "Find a common denominator: LCM(3,4) = 12.",
        "Rewrite: 4/12 + 3/12.",
        "Add numerators: 7/12.",
      ],
    },
  ],
  questions: [
    {
      id: "f1",
      prompt: "1/5 + 2/5 = ?",
      choices: ["2/5", "3/5", "3/10", "1/5"],
      answerIndex: 1,
      difficulty: "Foundational",
      explanation: "Same denominator: add numerators. 1+2=3, so 3/5.",
    },
    {
      id: "f2",
      prompt: "3/8 + 1/8 = ?",
      choices: ["4/16", "1/2", "4/8 only", "3/8"],
      answerIndex: 1,
      difficulty: "Foundational",
      explanation: "3/8 + 1/8 = 4/8 = 1/2 after simplification.",
    },
    {
      id: "f3",
      prompt: "1/2 + 1/3 = ?",
      choices: ["2/5", "5/6", "1/6", "2/6"],
      answerIndex: 1,
      difficulty: "Standard",
      explanation: "LCM(2,3)=6. 3/6 + 2/6 = 5/6.",
    },
    {
      id: "f4",
      prompt: "5/6 − 1/4 = ?",
      choices: ["4/2", "7/12", "1/2", "4/10"],
      answerIndex: 1,
      difficulty: "Standard",
      explanation: "LCM(6,4)=12. 10/12 − 3/12 = 7/12.",
    },
    {
      id: "f5",
      prompt: "2/3 + 3/4 = ?",
      choices: ["5/7", "17/12", "6/12", "1"],
      answerIndex: 1,
      difficulty: "Standard",
      explanation: "LCM(3,4)=12. 8/12 + 9/12 = 17/12 (or 1 5/12).",
    },
    {
      id: "f6",
      prompt: "Simplify: 7/14 + 3/14",
      choices: ["10/14", "5/7", "10/28", "1"],
      answerIndex: 1,
      difficulty: "Foundational",
      explanation: "10/14 simplifies by dividing top & bottom by 2 → 5/7.",
    },
    {
      id: "f7",
      prompt: "3 1/2 + 2 1/4 = ?",
      choices: ["5 1/4", "5 3/4", "5 2/6", "6"],
      answerIndex: 1,
      difficulty: "Challenge",
      explanation: "Whole: 3+2=5. Fractions: 1/2+1/4 = 2/4+1/4 = 3/4. → 5 3/4.",
    },
    {
      id: "f8",
      prompt: "Which is larger: 5/8 or 3/5?",
      choices: ["3/5", "5/8", "Equal", "Cannot tell"],
      answerIndex: 1,
      difficulty: "Challenge",
      explanation: "Common denominator 40: 25/40 vs 24/40. 5/8 is larger.",
    },
    {
      id: "f9",
      prompt: "4/9 + 2/9 − 1/9 = ?",
      choices: ["5/9", "7/9", "5/27", "6/9"],
      answerIndex: 0,
      difficulty: "Standard",
      explanation: "All ninths: 4+2−1 = 5. Answer: 5/9.",
    },
    {
      id: "f10",
      prompt: "Express 1/2 + 1/5 as a single fraction.",
      choices: ["2/7", "7/10", "1/10", "2/10"],
      answerIndex: 1,
      difficulty: "Standard",
      explanation: "LCM(2,5)=10. 5/10 + 2/10 = 7/10.",
      examTag: "WAEC",
    },
  ],
};

const algebraTopic: Topic = {
  id: "linear-equations",
  title: "Linear Equations in One Variable",
  objective: "Solve linear equations using inverse operations.",
  videoUrl: "https://www.youtube.com/embed/Qyd_v3DGzTM",
  workedExamples: [
    {
      title: "Example 1",
      steps: ["Solve 2x + 3 = 11.", "Subtract 3: 2x = 8.", "Divide by 2: x = 4."],
    },
    {
      title: "Example 2",
      steps: [
        "Solve 5x − 2 = 3x + 8.",
        "Subtract 3x: 2x − 2 = 8.",
        "Add 2: 2x = 10.",
        "Divide: x = 5.",
      ],
    },
  ],
  questions: [
    {
      id: "a1",
      prompt: "Solve x + 5 = 12",
      choices: ["5", "7", "12", "17"],
      answerIndex: 1,
      difficulty: "Foundational",
      explanation: "Subtract 5: x = 7.",
    },
    {
      id: "a2",
      prompt: "Solve 3x = 21",
      choices: ["3", "7", "21", "18"],
      answerIndex: 1,
      difficulty: "Foundational",
      explanation: "Divide both sides by 3: x = 7.",
    },
    {
      id: "a3",
      prompt: "Solve 2x + 4 = 10",
      choices: ["2", "3", "5", "7"],
      answerIndex: 1,
      difficulty: "Standard",
      explanation: "2x = 6 → x = 3.",
    },
    {
      id: "a4",
      prompt: "Solve 5x − 3 = 12",
      choices: ["1.8", "3", "5", "9"],
      answerIndex: 1,
      difficulty: "Standard",
      explanation: "5x = 15 → x = 3.",
    },
    {
      id: "a5",
      prompt: "Solve 4(x − 1) = 16",
      choices: ["3", "4", "5", "6"],
      answerIndex: 2,
      difficulty: "Standard",
      explanation: "x − 1 = 4 → x = 5.",
    },
    {
      id: "a6",
      prompt: "Solve 7x + 2 = 3x + 18",
      choices: ["2", "4", "5", "6"],
      answerIndex: 1,
      difficulty: "Challenge",
      explanation: "4x = 16 → x = 4.",
    },
    {
      id: "a7",
      prompt: "Solve x/3 = 6",
      choices: ["2", "9", "18", "3"],
      answerIndex: 2,
      difficulty: "Foundational",
      explanation: "Multiply both sides by 3: x = 18.",
    },
    {
      id: "a8",
      prompt: "Solve 2(x + 3) = x + 11",
      choices: ["3", "5", "8", "11"],
      answerIndex: 1,
      difficulty: "Challenge",
      explanation: "2x + 6 = x + 11 → x = 5.",
    },
    {
      id: "a9",
      prompt: "Solve 10 − x = 4",
      choices: ["−6", "4", "6", "14"],
      answerIndex: 2,
      difficulty: "Foundational",
      explanation: "−x = −6 → x = 6.",
    },
    {
      id: "a10",
      prompt: "Solve (x + 2)/4 = 3",
      choices: ["10", "12", "5", "14"],
      answerIndex: 0,
      difficulty: "Standard",
      explanation: "x + 2 = 12 → x = 10.",
      examTag: "BECE",
    },
  ],
};

const geometryTopic: Topic = {
  id: "area-perimeter",
  title: "Area and Perimeter",
  objective: "Calculate area and perimeter of rectangles, triangles, and circles.",
  videoUrl: "https://www.youtube.com/embed/xCdxURXMdFY",
  workedExamples: [
    {
      title: "Rectangle",
      steps: ["Rectangle 8 × 5.", "Area = length × width = 40.", "Perimeter = 2(8+5) = 26."],
    },
    {
      title: "Circle",
      steps: ["Circle radius 7.", "Area = πr² = π × 49 ≈ 153.94.", "Circumference = 2πr ≈ 43.98."],
    },
  ],
  questions: [
    {
      id: "g1",
      prompt: "Area of a 6×4 rectangle?",
      choices: ["10", "20", "24", "12"],
      answerIndex: 2,
      difficulty: "Foundational",
      explanation: "A = l × w = 6 × 4 = 24.",
    },
    {
      id: "g2",
      prompt: "Perimeter of a 6×4 rectangle?",
      choices: ["10", "20", "24", "12"],
      answerIndex: 1,
      difficulty: "Foundational",
      explanation: "P = 2(6+4) = 20.",
    },
    {
      id: "g3",
      prompt: "Area of a triangle with base 10 and height 6?",
      choices: ["30", "60", "16", "20"],
      answerIndex: 0,
      difficulty: "Standard",
      explanation: "A = ½bh = ½(10)(6) = 30.",
    },
    {
      id: "g4",
      prompt: "Circumference of a circle radius 5 (use π=3.14)?",
      choices: ["15.7", "31.4", "78.5", "10"],
      answerIndex: 1,
      difficulty: "Standard",
      explanation: "C = 2πr = 2·3.14·5 = 31.4.",
    },
    {
      id: "g5",
      prompt: "Area of a circle radius 3 (π=3.14)?",
      choices: ["9.42", "18.84", "28.26", "6.28"],
      answerIndex: 2,
      difficulty: "Standard",
      explanation: "A = πr² = 3.14·9 = 28.26.",
    },
    {
      id: "g6",
      prompt: "Square with perimeter 36 has area?",
      choices: ["36", "81", "144", "324"],
      answerIndex: 1,
      difficulty: "Challenge",
      explanation: "Side = 36/4 = 9. Area = 81.",
    },
    {
      id: "g7",
      prompt: "Area of a square of side 7?",
      choices: ["14", "28", "49", "21"],
      answerIndex: 2,
      difficulty: "Foundational",
      explanation: "A = s² = 49.",
    },
    {
      id: "g8",
      prompt: "A triangle has sides 5, 5, 5. Perimeter?",
      choices: ["10", "12.5", "15", "25"],
      answerIndex: 2,
      difficulty: "Foundational",
      explanation: "P = 5+5+5 = 15.",
    },
    {
      id: "g9",
      prompt: "Rectangle area 48, width 6. Length?",
      choices: ["6", "7", "8", "12"],
      answerIndex: 2,
      difficulty: "Standard",
      explanation: "l = A/w = 48/6 = 8.",
    },
    {
      id: "g10",
      prompt: "Right triangle legs 3 and 4. Hypotenuse?",
      choices: ["5", "6", "7", "12"],
      answerIndex: 0,
      difficulty: "Challenge",
      explanation: "By Pythagoras: √(9+16) = 5.",
      examTag: "GCSE",
    },
  ],
};

const ratiosTopic: Topic = {
  id: "ratios-proportions",
  title: "Ratios and Proportions",
  objective: "Understand ratios, find equivalent ratios, and solve proportion problems.",
  videoUrl: "https://www.youtube.com/embed/HPDWOZc_lI0",
  workedExamples: [
    {
      title: "Example 1 — Simplify a Ratio",
      steps: [
        "Start with the ratio 12:18.",
        "Find the greatest common divisor (GCD) of 12 and 18, which is 6.",
        "Divide both numbers by 6: 12/6 = 2, and 18/6 = 3.",
        "The simplified ratio is 2:3.",
      ],
    },
    {
      title: "Example 2 — Solving a Proportion",
      steps: [
        "Solve for x: x/5 = 12/20.",
        "Cross-multiply: x * 20 = 5 * 12, so 20x = 60.",
        "Divide both sides by 20: x = 60/20.",
        "Answer: x = 3.",
      ],
    },
  ],
  questions: [
    {
      id: "r1",
      prompt: "Simplify the ratio 8:12.",
      choices: ["2:3", "3:4", "4:6", "1:2"],
      answerIndex: 0,
      difficulty: "Foundational",
      explanation: "Divide both 8 and 12 by their greatest common divisor, 4, to get 2:3.",
    },
    {
      id: "r2",
      prompt: "If 3 apples cost $1.50, how much do 6 apples cost?",
      choices: ["$3.00", "$2.50", "$4.00", "$4.50"],
      answerIndex: 0,
      difficulty: "Foundational",
      explanation: "6 apples is twice as many as 3, so they cost twice as much: $1.50 * 2 = $3.00.",
    },
    {
      id: "r3",
      prompt: "Solve for x: x/4 = 9/12",
      choices: ["3", "4", "6", "9"],
      answerIndex: 0,
      difficulty: "Standard",
      explanation: "Cross-multiply: 12x = 36 -> x = 3.",
    },
    {
      id: "r4",
      prompt: "A map scale is 1 cm : 5 km. If the distance on the map is 4 cm, what is the actual distance?",
      choices: ["20 km", "10 km", "15 km", "25 km"],
      answerIndex: 0,
      difficulty: "Standard",
      explanation: "Multiply the map distance by the scale: 4 * 5 = 20 km.",
    },
    {
      id: "r5",
      prompt: "Are the ratios 2:3 and 6:9 equivalent?",
      choices: ["Yes", "No", "Only under conditions", "Cannot determine"],
      answerIndex: 0,
      difficulty: "Foundational",
      explanation: "Simplify 6:9 by dividing both by 3, which gives 2:3. They are equivalent.",
    },
    {
      id: "r6",
      prompt: "Find the missing term in the proportion 5:8 = 15:x.",
      choices: ["24", "16", "20", "30"],
      answerIndex: 0,
      difficulty: "Standard",
      explanation: "Since 5 * 3 = 15, we must multiply 8 by 3 to find x: 8 * 3 = 24.",
    },
    {
      id: "r7",
      prompt: "If a car travels 120 miles in 2 hours, what is its rate in miles per hour?",
      choices: ["60 mph", "50 mph", "70 mph", "55 mph"],
      answerIndex: 0,
      difficulty: "Foundational",
      explanation: "Rate = Distance / Time = 120 / 2 = 60 mph.",
    },
    {
      id: "r8",
      prompt: "Divide 20 in the ratio 2:3.",
      choices: ["8 and 12", "10 and 10", "6 and 14", "5 and 15"],
      answerIndex: 0,
      difficulty: "Challenge",
      explanation: "Total parts = 2 + 3 = 5. One part = 20 / 5 = 4. Parts are 2*4=8 and 3*4=12.",
    },
    {
      id: "r9",
      prompt: "Out of 30 students, 12 are boys. What is the ratio of girls to boys?",
      choices: ["3:2", "2:3", "5:3", "3:5"],
      answerIndex: 0,
      difficulty: "Challenge",
      explanation: "Number of girls = 30 - 12 = 18. Ratio of girls to boys is 18:12, which simplifies to 3:2.",
    },
    {
      id: "r10",
      prompt: "Solve the proportion: 3/x = 15/25",
      choices: ["5", "3", "6", "10"],
      answerIndex: 0,
      difficulty: "Standard",
      explanation: "Cross-multiply: 15x = 75 -> x = 5.",
    },
  ],
};

const sharedTopics = [fractionsTopic, ratiosTopic, geometryTopic, algebraTopic];

export function getFallbackTopicsForGrade(totalGrades: number, index: number): Topic[] {
  if (totalGrades === 3) {
    if (index === 0) return [fractionsTopic, ratiosTopic, geometryTopic];
    if (index === 1) return [fractionsTopic, geometryTopic, algebraTopic];
    return [ratiosTopic, geometryTopic, algebraTopic];
  } else if (totalGrades === 4) {
    if (index === 0) return [fractionsTopic, ratiosTopic, geometryTopic];
    if (index === 1) return [fractionsTopic, ratiosTopic, algebraTopic];
    if (index === 2) return [fractionsTopic, geometryTopic, algebraTopic];
    return [ratiosTopic, geometryTopic, algebraTopic];
  }
  return [fractionsTopic, geometryTopic, algebraTopic];
}

export function sortGrades(grades: any[]): any[] {
  const getWeight = (id: string) => {
    if (id.endsWith("-6eme")) return 1;
    if (id.endsWith("-5eme")) return 2;
    if (id.endsWith("-4eme")) return 3;
    if (id.endsWith("-3eme")) return 4;
    if (id === "y8") return 8;
    if (id === "y9") return 9;
    if (id === "y10") return 10;
    if ((id.includes("shs") || id.includes("ss")) && !id.includes("jss")) {
      const match = id.match(/\d+/);
      return 10 + (match ? parseInt(match[0], 10) : 0);
    }
    const match = id.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
  };
  return [...grades].sort((a, b) => getWeight(a.id) - getWeight(b.id));
}

export const COUNTRIES: Country[] = RAW_COUNTRIES.map((rc) => ({
  code: rc.code,
  name: rc.name,
  flag: rc.flag,
  curriculum: rc.curriculum,
  grades: rc.grades.map((g, index) => ({
    id: g.id,
    label: g.label,
    topics: getFallbackTopicsForGrade(rc.grades.length, index),
  })),
}));

let dbCountries: Country[] | null = null;
let dbTopics: Topic[] | null = null;

export async function loadCurriculumFromDatabase() {
  try {
    // Fetch all curriculum data in parallel to maximize performance and minimize network RTT bottlenecks
    const [
      { data: curriculaData, error: cError },
      { data: gradesData, error: gError },
      { data: topicsData, error: tError },
      { data: mappingData, error: mError },
      { data: questionsData, error: qError },
    ] = await Promise.all([
      supabase.from("curricula").select("*"),
      supabase.from("grades").select("*"),
      supabase.from("topics").select("*"),
      supabase.from("grade_topics").select("*"),
      supabase.from("questions").select("*"),
    ]);

    if (cError || !curriculaData) throw cError || new Error("No curricula found");
    if (gError || !gradesData) throw gError;
    if (tError || !topicsData) throw tError;
    if (mError || !mappingData) throw mError;
    if (qError || !questionsData) throw qError;

    // Build topics array with their questions
    const topicsMap = new Map<string, Topic>();
    for (const t of topicsData) {
      const topicQuestions = questionsData
        .filter((q: any) => q.topic_id === t.id)
        .map((q: any) => ({
          id: q.id,
          prompt: q.prompt,
          choices: q.choices,
          answerIndex: q.answer_index,
          difficulty: q.difficulty as Difficulty,
          explanation: q.explanation,
          examTag: q.exam_tag || undefined,
        }));

      topicsMap.set(t.id, {
        id: t.id,
        title: t.title,
        objective: t.objective,
        videoUrl: t.video_url,
        workedExamples: (t.worked_examples as any) || [],
        questions: topicQuestions,
      });
    }

    // Build countries structure
    const countriesList: Country[] = [];
    for (const c of curriculaData) {
      const unsortedGrades = gradesData.filter((g: any) => g.country_code === c.code);
      const countryGrades = sortGrades(unsortedGrades);
      const gradesList: Grade[] = [];

      for (let index = 0; index < countryGrades.length; index++) {
        const g = countryGrades[index];
        const gradeTopicIds = mappingData
          .filter((m: any) => m.grade_id === g.id)
          .map((m: any) => m.topic_id);

        const gradeTopicsList: Topic[] = [];
        for (const tid of gradeTopicIds) {
          const t = topicsMap.get(tid);
          if (t) gradeTopicsList.push(t);
        }

        gradesList.push({
          id: g.id,
          label: g.label,
          topics:
            gradeTopicsList.length > 0
              ? gradeTopicsList
              : getFallbackTopicsForGrade(countryGrades.length, index),
        });
      }

      countriesList.push({
        code: c.code,
        name: c.name,
        flag: c.flag,
        curriculum: c.curriculum_name,
        grades: gradesList,
      });
    }

    if (countriesList.length > 0) {
      dbCountries = countriesList;
    }
    if (topicsMap.size > 0) {
      dbTopics = Array.from(topicsMap.values());
    }
    console.log("Successfully loaded curriculum from Supabase database:", dbCountries);
  } catch (err) {
    console.warn(
      "Could not load curriculum from Supabase (falling back to static local data):",
      err,
    );
  }
}

export function getCountriesList(): Country[] {
  const dbList = dbCountries || [];
  const merged = [...dbList];
  for (const staticC of COUNTRIES) {
    if (!merged.some((c) => c.code === staticC.code)) {
      merged.push(staticC);
    }
  }
  return merged.sort((a, b) => a.name.localeCompare(b.name));
}

export function getCountry(code: string): Country | undefined {
  const list = getCountriesList();
  return list.find((c) => c.code === code);
}

export function getGrade(countryCode: string, gradeId: string): Grade | undefined {
  return getCountry(countryCode)?.grades.find((g) => g.id === gradeId);
}

export function getTopic(topicId: string): Topic | undefined {
  if (dbTopics) {
    const found = dbTopics.find((t) => t.id === topicId);
    if (found) return found;
  }
  return sharedTopics.find((t) => t.id === topicId);
}

export const ALL_TOPICS = sharedTopics;
