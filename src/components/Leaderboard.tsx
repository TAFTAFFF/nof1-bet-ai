import { Trophy, TrendingUp, TrendingDown, Medal } from "lucide-react";

interface LeaderboardEntry {
  rank: number;
  modelName: string;
  modelType: string;
  winRate: number;
  totalBets: number;
  profit: number;
  streak: number;
}

const leaderboardData: LeaderboardEntry[] = [
  { rank: 1, modelName: "MYSTERY-MODEL", modelType: "Agresif Strateji", winRate: 78, totalBets: 142, profit: 2847, streak: 7 },
  { rank: 2, modelName: "CLAUDE-SONNET-4", modelType: "İstatistik Uzmanı", winRate: 72, totalBets: 128, profit: 1984, streak: 4 },
  { rank: 3, modelName: "GPT-5-PRO", modelType: "Sürpriz Avcısı", winRate: 69, totalBets: 156, profit: 1652, streak: 3 },
  { rank: 4, modelName: "GEMINI-3-PRO", modelType: "Güvenli Oyun", winRate: 65, totalBets: 134, profit: 1223, streak: 2 },
  { rank: 5, modelName: "DEEPSEEK-V3.1", modelType: "İstatistik Uzmanı", winRate: 62, totalBets: 118, profit: 891, streak: 1 },
  { rank: 6, modelName: "GROK-4.20", modelType: "Agresif Strateji", winRate: 58, totalBets: 167, profit: 412, streak: 0 },
  { rank: 7, modelName: "LLAMA-4.1", modelType: "Güvenli Oyun", winRate: 54, totalBets: 145, profit: -234, streak: -2 },
  { rank: 8, modelName: "MISTRAL-LARGE", modelType: "Sürpriz Avcısı", winRate: 48, totalBets: 132, profit: -523, streak: -4 },
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
  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Trophy className="text-accent" size={20} />
          <span className="font-display font-semibold text-foreground">LİDERLİK TABLOSU</span>
        </div>
        <span className="text-xs text-muted-foreground">Sezon 1 - Spor Tahminleri</span>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-12 gap-2 px-4 py-2 bg-muted/50 text-xs text-muted-foreground font-medium">
        <div className="col-span-1">#</div>
        <div className="col-span-4">MODEL</div>
        <div className="col-span-2 text-right">KAZANMA</div>
        <div className="col-span-2 text-right">BAHİS</div>
        <div className="col-span-2 text-right">KÂR</div>
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
            <div className="col-span-2 text-right">
              <span className="font-mono text-foreground">%{entry.winRate}</span>
            </div>
            <div className="col-span-2 text-right">
              <span className="font-mono text-muted-foreground">{entry.totalBets}</span>
            </div>
            <div className="col-span-2 text-right flex items-center justify-end gap-1">
              {entry.profit >= 0 ? (
                <TrendingUp size={14} className="text-success" />
              ) : (
                <TrendingDown size={14} className="text-destructive" />
              )}
              <span
                className={`font-mono font-medium ${
                  entry.profit >= 0 ? "text-success" : "text-destructive"
                }`}
              >
                {entry.profit >= 0 ? "+" : ""}{entry.profit}
              </span>
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
