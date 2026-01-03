import { Calendar, Clock, TrendingUp, Users, RefreshCw, Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Prediction } from "@/hooks/usePredictions";

const getPredictionLabel = (prediction: string, homeTeam: string, awayTeam: string) => {
  const lower = prediction.toLowerCase();
  if (lower.includes("beraberlik") || lower.includes("draw")) return "Beraberlik";
  if (lower.includes("ev sahibi") || lower.includes("home")) return `${homeTeam} Kazanır`;
  if (lower.includes("deplasman") || lower.includes("away")) return `${awayTeam} Kazanır`;
  return prediction;
};

const parseMatchTeams = (matchName: string) => {
  const parts = matchName.split(" vs ");
  return {
    homeTeam: parts[0]?.trim() || matchName,
    awayTeam: parts[1]?.trim() || "Rakip"
  };
};

const getSportType = (matchName: string): "football" | "basketball" => {
  const basketballKeywords = ["Lakers", "Celtics", "Warriors", "Nuggets", "Efes", "Beko", "NBA", "Euroleague"];
  return basketballKeywords.some(k => matchName.includes(k)) ? "basketball" : "football";
};

const formatMatchDate = (dateStr: string | null, createdAt: string) => {
  const date = dateStr ? new Date(dateStr) : new Date(createdAt);
  return {
    date: new Intl.DateTimeFormat('tr-TR', { day: '2-digit', month: 'long' }).format(date),
    time: new Intl.DateTimeFormat('tr-TR', { hour: '2-digit', minute: '2-digit' }).format(date)
  };
};

const UpcomingMatches = () => {
  const [isFetching, setIsFetching] = useState(false);
  const queryClient = useQueryClient();

  const { data: predictions, isLoading, error } = useQuery({
    queryKey: ["upcoming-matches"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("predictions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(8);

      if (error) throw error;
      return data as Prediction[];
    },
  });

  const handleFetchMatches = async () => {
    setIsFetching(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fetch-matches`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          toast.error('Rate limit aşıldı, lütfen biraz bekleyin');
          return;
        }
        throw new Error(data.error || 'Maçlar çekilemedi');
      }

      toast.success(`${data.matches?.length || 0} maç güncellendi!`);
      queryClient.invalidateQueries({ queryKey: ["upcoming-matches"] });
      queryClient.invalidateQueries({ queryKey: ["predictions"] });
    } catch (error) {
      console.error('Fetch matches error:', error);
      toast.error('Maçlar çekilirken hata oluştu');
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Calendar className="text-secondary" size={20} />
          <span className="font-display font-semibold text-foreground">YAKLAŞAN MAÇLAR</span>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleFetchMatches}
          disabled={isFetching}
          className="text-xs"
        >
          <RefreshCw className={`h-3 w-3 mr-1 ${isFetching ? 'animate-spin' : ''}`} />
          {isFetching ? 'Çekiliyor...' : 'Maçları Güncelle'}
        </Button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="animate-spin text-primary" size={24} />
          <span className="ml-2 text-muted-foreground">Yükleniyor...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-4 text-center text-destructive">
          Veriler yüklenirken hata oluştu
        </div>
      )}

      {/* No Data State */}
      {!isLoading && !error && predictions?.length === 0 && (
        <div className="p-8 text-center">
          <Calendar className="mx-auto mb-3 text-muted-foreground" size={32} />
          <p className="text-muted-foreground">Henüz maç verisi yok</p>
          <p className="text-xs text-muted-foreground mt-1">
            "Maçları Güncelle" butonuna tıklayarak verileri çekin
          </p>
        </div>
      )}

      {/* Matches */}
      <div className="divide-y divide-border">
        {predictions?.map((prediction) => {
          const { homeTeam, awayTeam } = parseMatchTeams(prediction.match_name);
          const sport = getSportType(prediction.match_name);
          const { date, time } = formatMatchDate(prediction.match_date, prediction.created_at);
          const winProbability = prediction.win_probability || prediction.confidence_score;

          return (
            <div key={prediction.id} className="p-4 hover:bg-muted/30 transition-colors">
              {/* League & Time */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{sport === "football" ? "⚽" : "🏀"}</span>
                  <span className="text-xs text-secondary font-medium">
                    {prediction.league_name || "Lig Bilgisi Yok"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar size={12} />
                  {date}
                  <Clock size={12} />
                  {time}
                </div>
              </div>

              {/* Teams */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex-1">
                  <span className="font-medium text-foreground">{homeTeam}</span>
                </div>
                <div className="px-4">
                  <span className="text-muted-foreground text-sm">vs</span>
                </div>
                <div className="flex-1 text-right">
                  <span className="font-medium text-foreground">{awayTeam}</span>
                </div>
              </div>

              {/* Score Prediction */}
              {prediction.score_prediction && (
                <div className="mb-3 text-center">
                  <span className="text-xs text-muted-foreground">Skor Tahmini: </span>
                  <span className="font-mono font-bold text-primary">{prediction.score_prediction}</span>
                </div>
              )}

              {/* AI Prediction */}
              <div className="flex items-center justify-between bg-muted/50 rounded p-2">
                <div className="flex items-center gap-2">
                  <TrendingUp size={14} className="text-primary" />
                  <span className="text-xs text-foreground">
                    AI: <span className="text-primary font-medium">
                      {getPredictionLabel(prediction.prediction, homeTeam, awayTeam)}
                    </span>
                  </span>
                  <span className="text-xs text-muted-foreground">
                    (%{winProbability} güven)
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Users size={12} />
                  {prediction.model_name}
                </div>
              </div>

              {/* Reasoning */}
              {prediction.reasoning && (
                <div className="mt-2 p-2 bg-primary/5 border border-primary/10 rounded text-xs text-muted-foreground">
                  {prediction.reasoning}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UpcomingMatches;