-- Add analysis column to predictions table
ALTER TABLE public.predictions ADD COLUMN IF NOT EXISTS analysis TEXT;

-- Enable realtime for predictions table
ALTER PUBLICATION supabase_realtime ADD TABLE public.predictions;