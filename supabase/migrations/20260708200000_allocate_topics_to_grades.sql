-- Database migration: Allocate topics to grades based on country progression rules
-- Target Table: public.grade_topics

-- 1. First, delete all existing mappings in grade_topics (which were created as a full cross-join)
DELETE FROM public.grade_topics;

-- 2. Dynamically allocate topics to grades based on their sorted index per country
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
  -- 3-grade systems
  -- Index 1 (Lowest): Fractions
  SELECT grade_id, 'fractions-basics' AS topic_id FROM ordered_grades WHERE total_grades = 3 AND grade_index = 1
  UNION ALL
  -- Index 2 (Middle): Area & Perimeter
  SELECT grade_id, 'area-perimeter' AS topic_id FROM ordered_grades WHERE total_grades = 3 AND grade_index = 2
  UNION ALL
  -- Index 3 (Highest): Linear Equations
  SELECT grade_id, 'linear-equations' AS topic_id FROM ordered_grades WHERE total_grades = 3 AND grade_index = 3
  
  UNION ALL
  
  -- 4-grade systems
  -- Index 1 (Lowest): Fractions
  SELECT grade_id, 'fractions-basics' AS topic_id FROM ordered_grades WHERE total_grades = 4 AND grade_index = 1
  UNION ALL
  -- Index 2: Fractions + Area & Perimeter
  SELECT grade_id, 'fractions-basics' AS topic_id FROM ordered_grades WHERE total_grades = 4 AND grade_index = 2
  UNION ALL
  SELECT grade_id, 'area-perimeter' AS topic_id FROM ordered_grades WHERE total_grades = 4 AND grade_index = 2
  UNION ALL
  -- Index 3: Area & Perimeter + Linear Equations
  SELECT grade_id, 'area-perimeter' AS topic_id FROM ordered_grades WHERE total_grades = 4 AND grade_index = 3
  UNION ALL
  SELECT grade_id, 'linear-equations' AS topic_id FROM ordered_grades WHERE total_grades = 4 AND grade_index = 3
  UNION ALL
  -- Index 4 (Highest): Linear Equations
  SELECT grade_id, 'linear-equations' AS topic_id FROM ordered_grades WHERE total_grades = 4 AND grade_index = 4
  
  UNION ALL
  
  -- Fallback for any other grade count (all topics)
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
