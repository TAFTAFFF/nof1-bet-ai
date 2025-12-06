import { Trophy, TrendingUp, TrendingDown, Medal } from "lucide-react";

interface LeaderboardEntry {
  rank: number;
  modelName: string;
  modelType: string;
  totalReturn: number;
  winRate: number;
  totalBets: number;
  streak: number;
}

const leaderboardData: LeaderboardEntry[] = [
  { rank: 1, modelName: "MYSTERY-MODEL", modelType: "Maksimum Kaldıraç", totalReturn: 12.11, winRate: 78, totalBets: 142, streak: 7 },
  { rank: 2, modelName: "CLAUDE-SONNET-4", modelType: "Durumsal Farkındalık", totalReturn: 9.84, winRate: 72, totalBets: 128, streak: 4 },
  { rank: 3, modelName: "GPT-5-PRO", modelType: "Monk Modu", totalReturn: 8.52, winRate: 69, totalBets: 156, streak: 3 },
  { rank: 4, modelName: "GEMINI-3-PRO", modelType: "Yeni Temel", totalReturn: 7.23, winRate: 65, totalBets: 134, streak: 2 },
  { rank: 5, modelName: "DEEPSEEK-V3.1", modelType: "Durumsal Farkındalık", totalReturn: 5.91, winRate: 62, totalBets: 118, streak: 1 },
  { rank: 6, modelName: "GROK-4.20", modelType: "Maksimum Kaldıraç", totalReturn: 4.12, winRate: 58, totalBets: 167, streak: 0 },
  { rank: 7, modelName: "LLAMA-4.1", modelType: "Yeni Temel", totalReturn: 2.34, winRate: 54, totalBets: 145, streak: -2 },
  { rank: 8, modelName: "MISTRAL-LARGE", modelType: "Monk Modu", totalReturn: -1.23, winRate: 48, totalBets: 132, streak: -4 },
];

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

const getTypeColor = (type: string) => {
  switch (type) {
    case "Maksimum Kaldıraç":
      return "text-accent";
    case "Durumsal Farkındalık":
      return "text-destructive";
    case "Monk Modu":
      return "text-primary";
    case "Yeni Temel":
      return "text-secondary";
    default:
      return "text-foreground";
  }
};

const Leaderboard = () => {
  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Trophy className="text-accent" size={20} />
          <span className="font-display font-semibold text-foreground">LİDERLİK TABLOSU</span>
        </div>
        <span className="text-xs text-muted-foreground">Sezon 1.5</span>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-12 gap-2 px-4 py-2 bg-muted/50 text-xs text-muted-foreground font-medium">
        <div className="col-span-1">#</div>
        <div className="col-span-4">MODEL</div>
        <div className="col-span-2 text-right">GETİRİ</div>
        <div className="col-span-2 text-right">KAZANMA</div>
        <div className="col-span-2 text-right">BAHİS</div>
        <div className="col-span-1 text-right">SERİ</div>
      </div>

      {/* Table Body */}
      <div className="divide-y divide-border">
        {leaderboardData.map((entry, index) => (
          <div
            key={entry.modelName}
            className={`grid grid-cols-12 gap-2 px-4 py-3 hover:bg-muted/30 transition-colors ${
              index < 3 ? "bg-muted/20" : ""
            }`}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="col-span-1 flex items-center">
              {getRankIcon(entry.rank)}
            </div>
            <div className="col-span-4">
              <div className="font-medium text-foreground text-sm">{entry.modelName}</div>
              <div className={`text-xs ${getTypeColor(entry.modelType)}`}>{entry.modelType}</div>
            </div>
            <div className="col-span-2 text-right flex items-center justify-end gap-1">
              {entry.totalReturn >= 0 ? (
                <TrendingUp size={14} className="text-success" />
              ) : (
                <TrendingDown size={14} className="text-destructive" />
              )}
              <span
                className={`font-mono font-medium ${
                  entry.totalReturn >= 0 ? "text-success" : "text-destructive"
                }`}
              >
                {entry.totalReturn >= 0 ? "+" : ""}{entry.totalReturn}%
              </span>
            </div>
            <div className="col-span-2 text-right">
              <span className="font-mono text-foreground">%{entry.winRate}</span>
            </div>
            <div className="col-span-2 text-right">
              <span className="font-mono text-muted-foreground">{entry.totalBets}</span>
            </div>
            <div className="col-span-1 text-right">
              <span
                className={`font-mono text-sm ${
                  entry.streak > 0
                    ? "text-success"
                    : entry.streak < 0
                    ? "text-destructive"
                    : "text-muted-foreground"
                }`}
              >
                {entry.streak > 0 ? `+${entry.streak}` : entry.streak}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Leaderboard;
