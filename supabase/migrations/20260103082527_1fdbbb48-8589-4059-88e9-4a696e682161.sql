-- Create automation_logs table for tracking edge function executions
CREATE TABLE public.automation_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  function_name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('started', 'success', 'error')),
  message TEXT,
  matches_processed INTEGER DEFAULT 0,
  analyses_generated INTEGER DEFAULT 0,
  error_details TEXT,
  execution_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on automation_logs
ALTER TABLE public.automation_logs ENABLE ROW LEVEL SECURITY;

-- Allow public read access for the status panel
CREATE POLICY "Allow public read access to automation_logs"
  ON public.automation_logs
  FOR SELECT
  USING (true);

-- Create index for faster queries
CREATE INDEX idx_automation_logs_created_at ON public.automation_logs(created_at DESC);
CREATE INDEX idx_automation_logs_function_name ON public.automation_logs(function_name);

-- Add columns to predictions for enhanced tracking
ALTER TABLE public.predictions 
ADD COLUMN IF NOT EXISTS match_date DATE,
ADD COLUMN IF NOT EXISTS league_name TEXT,
ADD COLUMN IF NOT EXISTS home_team TEXT,
ADD COLUMN IF NOT EXISTS away_team TEXT,
ADD COLUMN IF NOT EXISTS api_event_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS reasoning TEXT,
ADD COLUMN IF NOT EXISTS score_prediction TEXT,
ADD COLUMN IF NOT EXISTS win_probability INTEGER,
ADD COLUMN IF NOT EXISTS last_updated TIMESTAMP WITH TIME ZONE DEFAULT now();