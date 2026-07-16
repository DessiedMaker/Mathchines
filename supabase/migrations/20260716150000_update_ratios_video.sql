-- Migration: Update video URL for Ratios and Proportions topic
-- This ensures the video content is populated in the live database.

UPDATE public.topics
SET video_url = 'https://www.youtube.com/embed/HPDWOZc_lI0'
WHERE id = 'ratios-proportions';
