import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

export interface Prediction {
  id: string;
  match_name: string;
  prediction: string;
  confidence_score: number;
  model_name: string;
  created_at: string;
  analysis?: string | null;
  // Enhanced fields
  match_date?: string | null;
  league_name?: string | null;
  home_team?: string | null;
  away_team?: string | null;
  reasoning?: string | null;
  score_prediction?: string | null;
  win_probability?: number | null;
  last_updated?: string | null;
}

export const usePredictions = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('predictions-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'predictions'
        },
        (payload) => {
          console.log('Realtime update:', payload);
          queryClient.invalidateQueries({ queryKey: ["predictions"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ["predictions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("predictions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Prediction[];
    },
  });
};

export const analyzePrediction = async (predictionId: string) => {
  const response = await supabase.functions.invoke('analyze-prediction', {
    body: { predictionId }
  });

  if (response.error) {
    throw new Error(response.error.message);
  }

  return response.data;
};
