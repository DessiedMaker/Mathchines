-- Migration: Update video URL for Ratios and Proportions topic to a valid YouTube embed
UPDATE public.topics
SET video_url = 'https://www.youtube.com/embed/fT3LEL2k6Z0'
WHERE id = 'ratios-proportions';
