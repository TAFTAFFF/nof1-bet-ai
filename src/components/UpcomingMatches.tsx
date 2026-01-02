import { Calendar, Clock, TrendingUp, Users, RefreshCw } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { toast } from "sonner";

interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  league: string;
  date: string;
  time: string;
  homeOdds: number;
  drawOdds?: number;
  awayOdds: number;
  aiPrediction: {
    result: "home" | "draw" | "away";
    confidence: number;
  };
  activeBets: number;
  sport: "football" | "basketball";
}

const upcomingMatches: Match[] = [
  {
    id: "1",
    homeTeam: "Galatasaray",
    awayTeam: "Fenerbahçe",
    league: "Süper Lig",
    date: "15 Aralık",
    time: "21:00",
    homeOdds: 1.85,
    drawOdds: 3.40,
    awayOdds: 4.20,
    aiPrediction: { result: "home", confidence: 72 },
    activeBets: 847,
    sport: "football",
  },
  {
    id: "2",
    homeTeam: "Anadolu Efes",
    awayTeam: "Fenerbahçe Beko",
    league: "Euroleague",
    date: "15 Aralık",
    time: "20:00",
    homeOdds: 1.72,
    awayOdds: 2.15,
    aiPrediction: { result: "home", confidence: 62 },
    activeBets: 534,
    sport: "basketball",
  },
  {
    id: "3",
    homeTeam: "Real Madrid",
    awayTeam: "Barcelona",
    league: "La Liga",
    date: "16 Aralık",
    time: "22:00",
    homeOdds: 1.95,
    drawOdds: 3.50,
    awayOdds: 3.80,
    aiPrediction: { result: "home", confidence: 68 },
    activeBets: 1243,
    sport: "football",
  },
  {
    id: "4",
    homeTeam: "Lakers",
    awayTeam: "Celtics",
    league: "NBA",
    date: "16 Aralık",
    time: "03:30",
    homeOdds: 2.10,
    awayOdds: 1.75,
    aiPrediction: { result: "away", confidence: 65 },
    activeBets: 1876,
    sport: "basketball",
  },
  {
    id: "5",
    homeTeam: "Man City",
    awayTeam: "Liverpool",
    league: "Premier League",
    date: "17 Aralık",
    time: "18:30",
    homeOdds: 2.10,
    drawOdds: 3.30,
    awayOdds: 3.40,
    aiPrediction: { result: "home", confidence: 58 },
    activeBets: 1567,
    sport: "football",
  },
];

const getPredictionLabel = (result: "home" | "draw" | "away", homeTeam: string, awayTeam: string, sport: string) => {
  if (result === "draw") return "Beraberlik";
  return result === "home" ? `${homeTeam} Kazanır` : `${awayTeam} Kazanır`;
};

const UpcomingMatches = () => {
  const [isFetching, setIsFetching] = useState(false);

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

      toast.success(`${data.matches?.length || 0} yeni maç eklendi!`);
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

      {/* Matches */}
      <div className="divide-y divide-border">
        {upcomingMatches.map((match) => (
          <div key={match.id} className="p-4 hover:bg-muted/30 transition-colors">
            {/* League & Time */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">{match.sport === "football" ? "⚽" : "🏀"}</span>
                <span className="text-xs text-secondary font-medium">{match.league}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar size={12} />
                {match.date}
                <Clock size={12} />
                {match.time}
              </div>
            </div>

            {/* Teams */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex-1">
                <span className="font-medium text-foreground">{match.homeTeam}</span>
              </div>
              <div className="px-4">
                <span className="text-muted-foreground text-sm">vs</span>
              </div>
              <div className="flex-1 text-right">
                <span className="font-medium text-foreground">{match.awayTeam}</span>
              </div>
            </div>

            {/* Odds */}
            <div className={`grid ${match.sport === "basketball" ? "grid-cols-2" : "grid-cols-3"} gap-2 mb-3`}>
              <div className={`text-center p-2 rounded ${match.aiPrediction.result === "home" ? "bg-primary/20 border border-primary" : "bg-muted"}`}>
                <div className="text-xs text-muted-foreground mb-1">1</div>
                <div className="font-mono font-medium text-foreground">{match.homeOdds}</div>
              </div>
              {match.drawOdds && (
                <div className={`text-center p-2 rounded ${match.aiPrediction.result === "draw" ? "bg-primary/20 border border-primary" : "bg-muted"}`}>
                  <div className="text-xs text-muted-foreground mb-1">X</div>
                  <div className="font-mono font-medium text-foreground">{match.drawOdds}</div>
                </div>
              )}
              <div className={`text-center p-2 rounded ${match.aiPrediction.result === "away" ? "bg-primary/20 border border-primary" : "bg-muted"}`}>
                <div className="text-xs text-muted-foreground mb-1">2</div>
                <div className="font-mono font-medium text-foreground">{match.awayOdds}</div>
              </div>
            </div>

            {/* AI Prediction */}
            <div className="flex items-center justify-between bg-muted/50 rounded p-2">
              <div className="flex items-center gap-2">
                <TrendingUp size={14} className="text-primary" />
                <span className="text-xs text-foreground">
                  AI: <span className="text-primary font-medium">{getPredictionLabel(match.aiPrediction.result, match.homeTeam, match.awayTeam, match.sport)}</span>
                </span>
                <span className="text-xs text-muted-foreground">(%{match.aiPrediction.confidence} güven)</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Users size={12} />
                {match.activeBets} bahis
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UpcomingMatches;
