import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Prediction {
  id: string;
  match_name: string;
  prediction: string;
  confidence_score: number;
  model_name: string;
  created_at: string;
}

export const usePredictions = () => {
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
