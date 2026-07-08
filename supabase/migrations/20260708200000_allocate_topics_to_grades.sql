-- Database migration: Add ratios-proportions topic, insert its questions, and allocate distinct combinations of exactly 3 topics to grades
-- Target Tables: public.topics, public.questions, public.grade_topics

-- 1. Insert the Ratios and Proportions topic
INSERT INTO public.topics (id, title, objective, video_url, worked_examples) VALUES
(
  'ratios-proportions',
  'Ratios and Proportions',
  'Understand ratios, find equivalent ratios, and solve proportion problems.',
  'https://www.youtube.com/embed/HPDWOZc_lI0',
  '[
    {"title": "Example 1 — Simplify a Ratio", "steps": ["Start with the ratio 12:18.", "Find the greatest common divisor (GCD) of 12 and 18, which is 6.", "Divide both numbers by 6: 12/6 = 2, and 18/6 = 3.", "The simplified ratio is 2:3."]},
    {"title": "Example 2 — Solving a Proportion", "steps": ["Solve for x: x/5 = 12/20.", "Cross-multiply: x * 20 = 5 * 12, so 20x = 60.", "Divide both sides by 20: x = 60/20.", "Answer: x = 3."]}
  ]'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  objective = EXCLUDED.objective,
  video_url = EXCLUDED.video_url,
  worked_examples = EXCLUDED.worked_examples;

-- 2. Insert questions for Ratios and Proportions
INSERT INTO public.questions (id, topic_id, prompt, choices, answer_index, difficulty, explanation, exam_tag) VALUES
('r1', 'ratios-proportions', 'Simplify the ratio 8:12.', ARRAY['2:3', '3:4', '4:6', '1:2'], 0, 'Foundational', 'Divide both 8 and 12 by their greatest common divisor, 4, to get 2:3.', NULL),
('r2', 'ratios-proportions', 'If 3 apples cost $1.50, how much do 6 apples cost?', ARRAY['$3.00', '$2.50', '$4.00', '$4.50'], 0, 'Foundational', '6 apples is twice as many as 3, so they cost twice as much: $1.50 * 2 = $3.00.', NULL),
('r3', 'ratios-proportions', 'Solve for x: x/4 = 9/12', ARRAY['3', '4', '6', '9'], 0, 'Standard', 'Cross-multiply: 12x = 36 -> x = 3.', NULL),
('r4', 'ratios-proportions', 'A map scale is 1 cm : 5 km. If the distance on the map is 4 cm, what is the actual distance?', ARRAY['20 km', '10 km', '15 km', '25 km'], 0, 'Standard', 'Multiply the map distance by the scale: 4 * 5 = 20 km.', NULL),
('r5', 'ratios-proportions', 'Are the ratios 2:3 and 6:9 equivalent?', ARRAY['Yes', 'No', 'Only under conditions', 'Cannot determine'], 0, 'Foundational', 'Simplify 6:9 by dividing both by 3, which gives 2:3. They are equivalent.', NULL),
('r6', 'ratios-proportions', 'Find the missing term in the proportion 5:8 = 15:x.', ARRAY['24', '16', '20', '30'], 0, 'Standard', 'Since 5 * 3 = 15, we must multiply 8 by 3 to find x: 8 * 3 = 24.', NULL),
('r7', 'ratios-proportions', 'If a car travels 120 miles in 2 hours, what is its rate in miles per hour?', ARRAY['60 mph', '50 mph', '70 mph', '55 mph'], 0, 'Foundational', 'Rate = Distance / Time = 120 / 2 = 60 mph.', NULL),
('r8', 'ratios-proportions', 'Divide 20 in the ratio 2:3.', ARRAY['8 and 12', '10 and 10', '6 and 14', '5 and 15'], 0, 'Challenge', 'Total parts = 2 + 3 = 5. One part = 20 / 5 = 4. Parts are 2*4=8 and 3*4=12.', NULL),
('r9', 'ratios-proportions', 'Out of 30 students, 12 are boys. What is the ratio of girls to boys?', ARRAY['3:2', '2:3', '5:3', '3:5'], 0, 'Challenge', 'Number of girls = 30 - 12 = 18. Ratio of girls to boys is 18:12, which simplifies to 3:2.', NULL),
('r10', 'ratios-proportions', 'Solve the proportion: 3/x = 15/25', ARRAY['5', '3', '6', '10'], 0, 'Standard', 'Cross-multiply: 15x = 75 -> x = 5.', NULL)
ON CONFLICT (id) DO UPDATE SET
  topic_id = EXCLUDED.topic_id,
  prompt = EXCLUDED.prompt,
  choices = EXCLUDED.choices,
  answer_index = EXCLUDED.answer_index,
  difficulty = EXCLUDED.difficulty,
  explanation = EXCLUDED.explanation,
  exam_tag = EXCLUDED.exam_tag;

-- 3. Delete existing mappings in public.grade_topics
DELETE FROM public.grade_topics;

-- 4. Re-allocate unique combinations of exactly 3 topics per grade based on total grade count (3 vs 4)
WITH ordered_grades AS (
  SELECT 
    id AS grade_id,
    country_code,
    ROW_NUMBER() OVER (
      PARTITION BY country_code 
      ORDER BY 
        CASE 
          -- French system: 6eme is lowest (1), 3eme is highest (4)
          WHEN id LIKE '%-6eme' THEN 1
          WHEN id LIKE '%-5eme' THEN 2
          WHEN id LIKE '%-4eme' THEN 3
          WHEN id LIKE '%-3eme' THEN 4
          -- Year levels
          WHEN id = 'y8' THEN 8
          WHEN id = 'y9' THEN 9
          WHEN id = 'y10' THEN 10
          -- Senior vs Junior High/Secondary
          WHEN (id LIKE '%shs%' OR id LIKE '%ss%') AND id NOT LIKE '%jss%' THEN 
            10 + COALESCE((regexp_match(id, '\d+'))[1]::integer, 0)
          -- General extraction of digits
          ELSE COALESCE((regexp_match(id, '\d+'))[1]::integer, 0)
        END
    ) as grade_index,
    COUNT(*) OVER (PARTITION BY country_code) as total_grades
  FROM public.grades
),
allocations AS (
  -- 3-grade systems:
  -- Grade index 1 (Fractions, Ratios, Geometry)
  SELECT grade_id, 'fractions-basics' AS topic_id FROM ordered_grades WHERE total_grades = 3 AND grade_index = 1
  UNION ALL
  SELECT grade_id, 'ratios-proportions' AS topic_id FROM ordered_grades WHERE total_grades = 3 AND grade_index = 1
  UNION ALL
  SELECT grade_id, 'area-perimeter' AS topic_id FROM ordered_grades WHERE total_grades = 3 AND grade_index = 1
  
  UNION ALL
  -- Grade index 2 (Fractions, Geometry, Algebra)
  SELECT grade_id, 'fractions-basics' AS topic_id FROM ordered_grades WHERE total_grades = 3 AND grade_index = 2
  UNION ALL
  SELECT grade_id, 'area-perimeter' AS topic_id FROM ordered_grades WHERE total_grades = 3 AND grade_index = 2
  UNION ALL
  SELECT grade_id, 'linear-equations' AS topic_id FROM ordered_grades WHERE total_grades = 3 AND grade_index = 2
  
  UNION ALL
  -- Grade index 3 (Ratios, Geometry, Algebra)
  SELECT grade_id, 'ratios-proportions' AS topic_id FROM ordered_grades WHERE total_grades = 3 AND grade_index = 3
  UNION ALL
  SELECT grade_id, 'area-perimeter' AS topic_id FROM ordered_grades WHERE total_grades = 3 AND grade_index = 3
  UNION ALL
  SELECT grade_id, 'linear-equations' AS topic_id FROM ordered_grades WHERE total_grades = 3 AND grade_index = 3
  
  UNION ALL
  
  -- 4-grade systems:
  -- Grade index 1 (Fractions, Ratios, Geometry)
  SELECT grade_id, 'fractions-basics' AS topic_id FROM ordered_grades WHERE total_grades = 4 AND grade_index = 1
  UNION ALL
  SELECT grade_id, 'ratios-proportions' AS topic_id FROM ordered_grades WHERE total_grades = 4 AND grade_index = 1
  UNION ALL
  SELECT grade_id, 'area-perimeter' AS topic_id FROM ordered_grades WHERE total_grades = 4 AND grade_index = 1
  
  UNION ALL
  -- Grade index 2 (Fractions, Ratios, Algebra)
  SELECT grade_id, 'fractions-basics' AS topic_id FROM ordered_grades WHERE total_grades = 4 AND grade_index = 2
  UNION ALL
  SELECT grade_id, 'ratios-proportions' AS topic_id FROM ordered_grades WHERE total_grades = 4 AND grade_index = 2
  UNION ALL
  SELECT grade_id, 'linear-equations' AS topic_id FROM ordered_grades WHERE total_grades = 4 AND grade_index = 2
  
  UNION ALL
  -- Grade index 3 (Fractions, Geometry, Algebra)
  SELECT grade_id, 'fractions-basics' AS topic_id FROM ordered_grades WHERE total_grades = 4 AND grade_index = 3
  UNION ALL
  SELECT grade_id, 'area-perimeter' AS topic_id FROM ordered_grades WHERE total_grades = 4 AND grade_index = 3
  UNION ALL
  SELECT grade_id, 'linear-equations' AS topic_id FROM ordered_grades WHERE total_grades = 4 AND grade_index = 3
  
  UNION ALL
  -- Grade index 4 (Ratios, Geometry, Algebra)
  SELECT grade_id, 'ratios-proportions' AS topic_id FROM ordered_grades WHERE total_grades = 4 AND grade_index = 4
  UNION ALL
  SELECT grade_id, 'area-perimeter' AS topic_id FROM ordered_grades WHERE total_grades = 4 AND grade_index = 4
  UNION ALL
  SELECT grade_id, 'linear-equations' AS topic_id FROM ordered_grades WHERE total_grades = 4 AND grade_index = 4
  
  UNION ALL
  
  -- Fallback for any other grade count (Fractions, Geometry, Algebra)
  SELECT grade_id, 'fractions-basics' AS topic_id FROM ordered_grades WHERE total_grades NOT IN (3, 4)
  UNION ALL
  SELECT grade_id, 'area-perimeter' AS topic_id FROM ordered_grades WHERE total_grades NOT IN (3, 4)
  UNION ALL
  SELECT grade_id, 'linear-equations' AS topic_id FROM ordered_grades WHERE total_grades NOT IN (3, 4)
)
INSERT INTO public.grade_topics (grade_id, topic_id)
SELECT grade_id, topic_id 
FROM allocations
ON CONFLICT DO NOTHING;
