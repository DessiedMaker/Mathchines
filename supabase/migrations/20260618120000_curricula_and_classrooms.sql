-- Create user role enum and add role column to profiles
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('student', 'teacher', 'parent');
  END IF;
END
$$;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role user_role;


-- Curricula
CREATE TABLE IF NOT EXISTS public.curricula (
  code text PRIMARY KEY,
  name text NOT NULL,
  flag text NOT NULL,
  curriculum_name text NOT NULL
);

ALTER TABLE public.curricula ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow select for authenticated users" ON public.curricula
  FOR SELECT TO authenticated USING (true);

-- Grades
CREATE TABLE IF NOT EXISTS public.grades (
  id text PRIMARY KEY,
  country_code text NOT NULL REFERENCES public.curricula(code) ON DELETE CASCADE,
  label text NOT NULL
);

ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow select for authenticated users" ON public.grades
  FOR SELECT TO authenticated USING (true);

-- Topics
CREATE TABLE IF NOT EXISTS public.topics (
  id text PRIMARY KEY,
  title text NOT NULL,
  objective text NOT NULL,
  video_url text NOT NULL,
  worked_examples jsonb NOT NULL DEFAULT '[]'::jsonb
);

ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow select for authenticated users" ON public.topics
  FOR SELECT TO authenticated USING (true);

-- Grade Topics relationship
CREATE TABLE IF NOT EXISTS public.grade_topics (
  grade_id text NOT NULL REFERENCES public.grades(id) ON DELETE CASCADE,
  topic_id text NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
  PRIMARY KEY (grade_id, topic_id)
);

ALTER TABLE public.grade_topics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow select for authenticated users" ON public.grade_topics
  FOR SELECT TO authenticated USING (true);

-- Questions
CREATE TABLE IF NOT EXISTS public.questions (
  id text PRIMARY KEY,
  topic_id text NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
  prompt text NOT NULL,
  choices text[] NOT NULL,
  answer_index integer NOT NULL,
  difficulty text NOT NULL,
  explanation text NOT NULL,
  exam_tag text
);

ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow select for authenticated users" ON public.questions
  FOR SELECT TO authenticated USING (true);

-- Classrooms
CREATE TABLE IF NOT EXISTS public.classrooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  teacher_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  grade_id text REFERENCES public.grades(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.classrooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can manage their own classrooms" ON public.classrooms
  FOR ALL TO authenticated USING (teacher_id = auth.uid()) WITH CHECK (teacher_id = auth.uid());

CREATE POLICY "Enrolled students can view classrooms" ON public.classrooms
  FOR SELECT TO authenticated USING (
    id IN (SELECT classroom_id FROM public.classroom_enrollments WHERE student_id = auth.uid())
    OR teacher_id = auth.uid()
  );

-- Classroom Enrollments
CREATE TABLE IF NOT EXISTS public.classroom_enrollments (
  classroom_id uuid NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (classroom_id, student_id)
);

ALTER TABLE public.classroom_enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can view/manage enrollments for their classrooms" ON public.classroom_enrollments
  FOR ALL TO authenticated USING (
    classroom_id IN (SELECT id FROM public.classrooms WHERE teacher_id = auth.uid())
  );

CREATE POLICY "Students can view/create enrollments for themselves" ON public.classroom_enrollments
  FOR ALL TO authenticated USING (student_id = auth.uid()) WITH CHECK (student_id = auth.uid());

-- Parent Student Links
CREATE TABLE IF NOT EXISTS public.parent_student_links (
  parent_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (parent_id, student_id)
);

ALTER TABLE public.parent_student_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can manage links to their students" ON public.parent_student_links
  FOR ALL TO authenticated USING (parent_id = auth.uid()) WITH CHECK (parent_id = auth.uid());

CREATE POLICY "Students can view parent links" ON public.parent_student_links
  FOR SELECT TO authenticated USING (student_id = auth.uid());


-- Seed Data

-- 1. Curricula
INSERT INTO public.curricula (code, name, flag, curriculum_name) VALUES
('GH', 'Ghana', '🇬🇭', 'GES / WAEC'),
('NG', 'Nigeria', '🇳🇬', 'NERDC / WAEC'),
('US', 'United States', '🇺🇸', 'Common Core'),
('UK', 'United Kingdom', '🇬🇧', 'GCSE')
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  flag = EXCLUDED.flag,
  curriculum_name = EXCLUDED.curriculum_name;

-- 2. Grades
INSERT INTO public.grades (id, country_code, label) VALUES
('jhs1', 'GH', 'JHS 1'),
('jhs2', 'GH', 'JHS 2'),
('jhs3', 'GH', 'JHS 3 (BECE)'),
('shs1', 'GH', 'SHS 1'),
('jss2', 'NG', 'JSS 2'),
('jss3', 'NG', 'JSS 3'),
('ss1', 'NG', 'SS 1'),
('g6', 'US', 'Grade 6'),
('g7', 'US', 'Grade 7'),
('g8', 'US', 'Grade 8'),
('g9', 'US', 'Grade 9 (Algebra I)'),
('y8', 'UK', 'Year 8'),
('y9', 'UK', 'Year 9'),
('y10', 'UK', 'Year 10 (GCSE)')
ON CONFLICT (id) DO UPDATE SET
  country_code = EXCLUDED.country_code,
  label = EXCLUDED.label;

-- 3. Topics
INSERT INTO public.topics (id, title, objective, video_url, worked_examples) VALUES
(
  'fractions-basics',
  'Fractions: Add & Subtract',
  'Add and subtract fractions with like and unlike denominators.',
  'https://www.youtube.com/embed/qFK6If4tyKY',
  '[
    {"title": "Example 1 — Like denominators", "steps": ["Start with 2/7 + 3/7.", "Denominators match, so add numerators: 2 + 3 = 5.", "Answer: 5/7."]},
    {"title": "Example 2 — Unlike denominators", "steps": ["Compute 1/3 + 1/4.", "Find a common denominator: LCM(3,4) = 12.", "Rewrite: 4/12 + 3/12.", "Add numerators: 7/12."]}
  ]'::jsonb
),
(
  'linear-equations',
  'Linear Equations in One Variable',
  'Solve linear equations using inverse operations.',
  'https://www.youtube.com/embed/Qyd_v3DGzTM',
  '[
    {"title": "Example 1", "steps": ["Solve 2x + 3 = 11.", "Subtract 3: 2x = 8.", "Divide by 2: x = 4."]},
    {"title": "Example 2", "steps": ["Solve 5x − 2 = 3x + 8.", "Subtract 3x: 2x − 2 = 8.", "Add 2: 2x = 10.", "Divide: x = 5."]}
  ]'::jsonb
),
(
  'area-perimeter',
  'Area and Perimeter',
  'Calculate area and perimeter of rectangles, triangles, and circles.',
  'https://www.youtube.com/embed/xCdxURXMdFY',
  '[
    {"title": "Rectangle", "steps": ["Rectangle 8 × 5.", "Area = length × width = 40.", "Perimeter = 2(8+5) = 26."]},
    {"title": "Circle", "steps": ["Circle radius 7.", "Area = πr² = π × 49 ≈ 153.94.", "Circumference = 2πr ≈ 43.98."]}
  ]'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  objective = EXCLUDED.objective,
  video_url = EXCLUDED.video_url,
  worked_examples = EXCLUDED.worked_examples;

-- 4. Grade Topics
INSERT INTO public.grade_topics (grade_id, topic_id)
SELECT g.id, t.id
FROM public.grades g, public.topics t
ON CONFLICT DO NOTHING;

-- 5. Questions

-- Fractions
INSERT INTO public.questions (id, topic_id, prompt, choices, answer_index, difficulty, explanation, exam_tag) VALUES
('f1', 'fractions-basics', '1/5 + 2/5 = ?', ARRAY['2/5', '3/5', '3/10', '1/5'], 1, 'Foundational', 'Same denominator: add numerators. 1+2=3, so 3/5.', NULL),
('f2', 'fractions-basics', '3/8 + 1/8 = ?', ARRAY['4/16', '1/2', '4/8 only', '3/8'], 1, 'Foundational', '3/8 + 1/8 = 4/8 = 1/2 after simplification.', NULL),
('f3', 'fractions-basics', '1/2 + 1/3 = ?', ARRAY['2/5', '5/6', '1/6', '2/6'], 1, 'Standard', 'LCM(2,3)=6. 3/6 + 2/6 = 5/6.', NULL),
('f4', 'fractions-basics', '5/6 − 1/4 = ?', ARRAY['4/2', '7/12', '1/2', '4/10'], 1, 'Standard', 'LCM(6,4)=12. 10/12 − 3/12 = 7/12.', NULL),
('f5', 'fractions-basics', '2/3 + 3/4 = ?', ARRAY['5/7', '17/12', '6/12', '1'], 1, 'Standard', 'LCM(3,4)=12. 8/12 + 9/12 = 17/12 (or 1 5/12).', NULL),
('f6', 'fractions-basics', 'Simplify: 7/14 + 3/14', ARRAY['10/14', '5/7', '10/28', '1'], 1, 'Foundational', '10/14 simplifies by dividing top & bottom by 2 → 5/7.', NULL),
('f7', 'fractions-basics', '3 1/2 + 2 1/4 = ?', ARRAY['5/4', '5 3/4', '5 2/6', '6'], 1, 'Challenge', 'Whole: 3+2=5. Fractions: 1/2+1/4 = 2/4+1/4 = 3/4. → 5 3/4.', NULL),
('f8', 'fractions-basics', 'Which is larger: 5/8 or 3/5?', ARRAY['3/5', '5/8', 'Equal', 'Cannot tell'], 1, 'Challenge', 'Common denominator 40: 25/40 vs 24/40. 5/8 is larger.', NULL),
('f9', 'fractions-basics', '4/9 + 2/9 − 1/9 = ?', ARRAY['5/9', '7/9', '5/27', '6/9'], 0, 'Standard', 'All ninths: 4+2−1 = 5. Answer: 5/9.', NULL),
('f10', 'fractions-basics', 'Express 1/2 + 1/5 as a single fraction.', ARRAY['2/7', '7/10', '1/10', '2/10'], 1, 'Standard', 'LCM(2,5)=10. 5/10 + 2/10 = 7/10.', 'WAEC')
ON CONFLICT (id) DO UPDATE SET
  topic_id = EXCLUDED.topic_id,
  prompt = EXCLUDED.prompt,
  choices = EXCLUDED.choices,
  answer_index = EXCLUDED.answer_index,
  difficulty = EXCLUDED.difficulty,
  explanation = EXCLUDED.explanation,
  exam_tag = EXCLUDED.exam_tag;

-- Algebra
INSERT INTO public.questions (id, topic_id, prompt, choices, answer_index, difficulty, explanation, exam_tag) VALUES
('a1', 'linear-equations', 'Solve x + 5 = 12', ARRAY['5', '7', '12', '17'], 1, 'Foundational', 'Subtract 5: x = 7.', NULL),
('a2', 'linear-equations', 'Solve 3x = 21', ARRAY['3', '7', '21', '18'], 1, 'Foundational', 'Divide both sides by 3: x = 7.', NULL),
('a3', 'linear-equations', 'Solve 2x + 4 = 10', ARRAY['2', '3', '5', '7'], 1, 'Standard', '2x = 6 → x = 3.', NULL),
('a4', 'linear-equations', 'Solve 5x − 3 = 12', ARRAY['1.8', '3', '5', '9'], 1, 'Standard', '5x = 15 → x = 3.', NULL),
('a5', 'linear-equations', 'Solve 4(x − 1) = 16', ARRAY['3', '4', '5', '6'], 2, 'Standard', 'x − 1 = 4 → x = 5.', NULL),
('a6', 'linear-equations', 'Solve 7x + 2 = 3x + 18', ARRAY['2', '4', '5', '6'], 1, 'Challenge', '4x = 16 → x = 4.', NULL),
('a7', 'linear-equations', 'Solve x/3 = 6', ARRAY['2', '9', '18', '3'], 2, 'Foundational', 'Multiply both sides by 3: x = 18.', NULL),
('a8', 'linear-equations', 'Solve 2(x + 3) = x + 11', ARRAY['3', '5', '8', '11'], 1, 'Challenge', '2x + 6 = x + 11 → x = 5.', NULL),
('a9', 'linear-equations', 'Solve 10 − x = 4', ARRAY['−6', '4', '6', '14'], 2, 'Foundational', '−x = −6 → x = 6.', NULL),
('a10', 'linear-equations', 'Solve (x + 2)/4 = 3', ARRAY['10', '12', '5', '14'], 0, 'Standard', 'x + 2 = 12 → x = 10.', 'BECE')
ON CONFLICT (id) DO UPDATE SET
  topic_id = EXCLUDED.topic_id,
  prompt = EXCLUDED.prompt,
  choices = EXCLUDED.choices,
  answer_index = EXCLUDED.answer_index,
  difficulty = EXCLUDED.difficulty,
  explanation = EXCLUDED.explanation,
  exam_tag = EXCLUDED.exam_tag;

-- Geometry
INSERT INTO public.questions (id, topic_id, prompt, choices, answer_index, difficulty, explanation, exam_tag) VALUES
('g1', 'area-perimeter', 'Area of a 6×4 rectangle?', ARRAY['10', '20', '24', '12'], 2, 'Foundational', 'A = l × w = 6 × 4 = 24.', NULL),
('g2', 'area-perimeter', 'Perimeter of a 6×4 rectangle?', ARRAY['10', '20', '24', '12'], 1, 'Foundational', 'P = 2(6+4) = 20.', NULL),
('g3', 'area-perimeter', 'Area of a triangle with base 10 and height 6?', ARRAY['30', '60', '16', '20'], 0, 'Standard', 'A = ½bh = ½(10)(6) = 30.', NULL),
('g4', 'area-perimeter', 'Circumference of a circle radius 5 (use π=3.14)?', ARRAY['15.7', '31.4', '78.5', '10'], 1, 'Standard', 'C = 2πr = 2·3.14·5 = 31.4.', NULL),
('g5', 'area-perimeter', 'Area of a circle radius 3 (π=3.14)?', ARRAY['9.42', '18.84', '28.26', '6.28'], 2, 'Standard', 'A = πr² = 3.14·9 = 28.26.', NULL),
('g6', 'area-perimeter', 'Square with perimeter 36 has area?', ARRAY['36', '81', '144', '324'], 1, 'Challenge', 'Side = 36/4 = 9. Area = 81.', NULL),
('g7', 'area-perimeter', 'Area of a square of side 7?', ARRAY['14', '28', '49', '21'], 2, 'Foundational', 'A = s² = 49.', NULL),
('g8', 'area-perimeter', 'A triangle has sides 5, 5, 5. Perimeter?', ARRAY['10', '12.5', '15', '25'], 2, 'Foundational', 'P = 5+5+5 = 15.', NULL),
('g9', 'area-perimeter', 'Rectangle area 48, width 6. Length?', ARRAY['6', '7', '8', '12'], 2, 'Standard', 'l = A/w = 48/6 = 8.', NULL),
('g10', 'area-perimeter', 'Right triangle legs 3 and 4. Hypotenuse?', ARRAY['5', '6', '7', '12'], 0, 'Challenge', 'By Pythagoras: √(9+16) = 5.', 'GCSE')
ON CONFLICT (id) DO UPDATE SET
  topic_id = EXCLUDED.topic_id,
  prompt = EXCLUDED.prompt,
  choices = EXCLUDED.choices,
  answer_index = EXCLUDED.answer_index,
  difficulty = EXCLUDED.difficulty,
  explanation = EXCLUDED.explanation,
  exam_tag = EXCLUDED.exam_tag;
