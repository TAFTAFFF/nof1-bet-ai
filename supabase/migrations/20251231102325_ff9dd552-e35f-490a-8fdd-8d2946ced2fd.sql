-- Create predictions table for AI model predictions
CREATE TABLE public.predictions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_name TEXT NOT NULL,
  prediction TEXT NOT NULL,
  confidence_score INTEGER NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 100),
  model_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (predictions are public)
CREATE POLICY "Predictions are viewable by everyone" 
ON public.predictions 
FOR SELECT 
USING (true);

-- Insert sample data
INSERT INTO public.predictions (match_name, prediction, confidence_score, model_name) VALUES
('Galatasaray vs Fenerbahçe', 'Galatasaray Kazanır', 72, 'Mystery Model'),
('Anadolu Efes vs Fenerbahçe Beko', 'Anadolu Efes Kazanır', 62, 'StatMaster'),
('Real Madrid vs Barcelona', 'Real Madrid Kazanır', 68, 'Mystery Model'),
('Lakers vs Celtics', 'Celtics Kazanır', 65, 'OddsOracle'),
('Man City vs Liverpool', 'Man City Kazanır', 58, 'BetGenius'),
('Bayern Münih vs Dortmund', 'Beraberlik', 55, 'StatMaster'),
('Beşiktaş vs Trabzonspor', 'Beşiktaş Kazanır', 71, 'Mystery Model'),
('Warriors vs Nuggets', 'Nuggets Kazanır', 63, 'OddsOracle');