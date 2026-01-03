import { Trophy, TrendingUp, TrendingDown, Medal, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ModelStats {
  modelName: string;
  totalPredictions: number;
  successfulPredictions: number;
  winRate: number;
  avgConfidence: number;
}

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Trophy className="text-accent" size={18} />;
    case 2:
      return <Medal className="text-muted-foreground" size={18} />;
    case 3:
      return <Medal className="text-amber-700" size={18} />;
    default:
      return <span className="text-muted-foreground font-mono text-sm w-[18px] text-center">{rank}</span>;
  }
};

const getModelType = (modelName: string) => {
  if (modelName.includes("Mystery") || modelName.includes("Agresif")) return "Agresif Strateji";
  if (modelName.includes("Stat") || modelName.includes("AI Auto")) return "İstatistik Uzmanı";
  if (modelName.includes("Oracle") || modelName.includes("Sürpriz")) return "Sürpriz Avcısı";
  return "Güvenli Oyun";
};

const getTypeColor = (type: string) => {
  switch (type) {
    case "Agresif Strateji":
      return "text-accent";
    case "İstatistik Uzmanı":
      return "text-destructive";
    case "Sürpriz Avcısı":
      return "text-primary";
    case "Güvenli Oyun":
      return "text-secondary";
    default:
      return "text-foreground";
  }
};

const Leaderboard = () => {
  const { data: modelStats, isLoading } = useQuery({
    queryKey: ["model-leaderboard"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("predictions")
        .select("model_name, confidence_score, prediction, analysis");

      if (error) throw error;

      // Group by model and calculate stats
      const statsMap = new Map<string, { total: number; confident: number; sumConfidence: number }>();

      data?.forEach((prediction) => {
        const modelName = prediction.model_name;
        const current = statsMap.get(modelName) || { total: 0, confident: 0, sumConfidence: 0 };
        
        current.total += 1;
        current.sumConfidence += prediction.confidence_score;
        
        // Count predictions with analysis as "successful" for demo purposes
        // In production, you'd track actual match results
        if (prediction.analysis) {
          current.confident += 1;
        }
        
        statsMap.set(modelName, current);
      });

      const stats: ModelStats[] = Array.from(statsMap.entries()).map(([modelName, data]) => ({
        modelName,
        totalPredictions: data.total,
        successfulPredictions: data.confident,
        winRate: data.total > 0 ? Math.round((data.confident / data.total) * 100) : 0,
        avgConfidence: data.total > 0 ? Math.round(data.sumConfidence / data.total) : 0
      }));

      // Sort by average confidence (simulating win rate)
      return stats.sort((a, b) => b.avgConfidence - a.avgConfidence);
    },
    refetchInterval: 60000, // Refresh every minute
  });

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Trophy className="text-accent" size={20} />
          <span className="font-display font-semibold text-foreground">LİDERLİK TABLOSU</span>
        </div>
        <span className="text-xs text-muted-foreground">Gerçek Zamanlı İstatistikler</span>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="animate-spin text-primary" size={24} />
          <span className="ml-2 text-muted-foreground">Yükleniyor...</span>
        </div>
      )}

      {/* No Data State */}
      {!isLoading && (!modelStats || modelStats.length === 0) && (
        <div className="p-8 text-center">
          <Trophy className="mx-auto mb-3 text-muted-foreground" size={32} />
          <p className="text-muted-foreground">Henüz model istatistiği yok</p>
          <p className="text-xs text-muted-foreground mt-1">
            Tahminler eklendikçe liderlik tablosu güncellenecek
          </p>
        </div>
      )}

      {/* Table Header */}
      {modelStats && modelStats.length > 0 && (
        <>
          <div className="grid grid-cols-12 gap-2 px-4 py-2 bg-muted/50 text-xs text-muted-foreground font-medium">
            <div className="col-span-1">#</div>
            <div className="col-span-4">MODEL</div>
            <div className="col-span-2 text-right">GÜVEN</div>
            <div className="col-span-2 text-right">TAHMİN</div>
            <div className="col-span-2 text-right">ANALİZ</div>
            <div className="col-span-1 text-right">%</div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-border">
            {modelStats.map((entry, index) => {
              const modelType = getModelType(entry.modelName);
              const rank = index + 1;

              return (
                <div
                  key={entry.modelName}
                  className={`grid grid-cols-12 gap-2 px-4 py-3 hover:bg-muted/30 transition-colors ${
                    index < 3 ? "bg-muted/20" : ""
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="col-span-1 flex items-center">
                    {getRankIcon(rank)}
                  </div>
                  <div className="col-span-4">
                    <div className="font-medium text-foreground text-sm truncate">{entry.modelName}</div>
                    <div className={`text-xs ${getTypeColor(modelType)}`}>{modelType}</div>
                  </div>
                  <div className="col-span-2 text-right">
                    <span className="font-mono text-foreground">%{entry.avgConfidence}</span>
                  </div>
                  <div className="col-span-2 text-right">
                    <span className="font-mono text-muted-foreground">{entry.totalPredictions}</span>
                  </div>
                  <div className="col-span-2 text-right flex items-center justify-end gap-1">
                    {entry.successfulPredictions > 0 ? (
                      <TrendingUp size={14} className="text-success" />
                    ) : (
                      <TrendingDown size={14} className="text-muted-foreground" />
                    )}
                    <span
                      className={`font-mono font-medium ${
                        entry.successfulPredictions > 0 ? "text-success" : "text-muted-foreground"
                      }`}
                    >
                      {entry.successfulPredictions}
                    </span>
                  </div>
                  <div className="col-span-1 text-right">
                    <span
                      className={`font-mono text-sm ${
                        entry.winRate >= 50
                          ? "text-success"
                          : entry.winRate > 0
                          ? "text-accent"
                          : "text-muted-foreground"
                      }`}
                    >
                      {entry.winRate}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default Leaderboard;