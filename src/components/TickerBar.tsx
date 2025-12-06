import { TrendingUp, TrendingDown } from "lucide-react";

interface TickerItem {
  symbol: string;
  teams: string;
  odds: string;
  change: number;
  type: "football" | "basketball";
  time: string;
}

const tickerData: TickerItem[] = [
  { symbol: "⚽", teams: "Galatasaray vs Fenerbahçe", odds: "1.85", change: -5.2, type: "football", time: "21:00" },
  { symbol: "🏀", teams: "Anadolu Efes vs Fenerbahçe Beko", odds: "1.72", change: 3.1, type: "basketball", time: "20:00" },
  { symbol: "⚽", teams: "Real Madrid vs Barcelona", odds: "1.95", change: 8.2, type: "football", time: "22:00" },
  { symbol: "🏀", teams: "Lakers vs Celtics", odds: "2.10", change: -2.1, type: "basketball", time: "03:30" },
  { symbol: "⚽", teams: "Man City vs Liverpool", odds: "2.25", change: 4.5, type: "football", time: "18:30" },
  { symbol: "🏀", teams: "Warriors vs Bucks", odds: "1.88", change: 1.8, type: "basketball", time: "04:00" },
  { symbol: "⚽", teams: "PSG vs Bayern Münih", odds: "2.40", change: -3.2, type: "football", time: "21:00" },
  { symbol: "🏀", teams: "Miami Heat vs Nuggets", odds: "2.15", change: 2.4, type: "basketball", time: "02:00" },
  { symbol: "⚽", teams: "Beşiktaş vs Trabzonspor", odds: "2.10", change: 1.5, type: "football", time: "19:00" },
  { symbol: "🏀", teams: "Euroleague Final", odds: "1.92", change: -1.8, type: "basketball", time: "21:30" },
];

const TickerBar = () => {
  const doubledData = [...tickerData, ...tickerData];

  return (
    <div className="fixed top-16 left-0 right-0 z-40 bg-card/90 backdrop-blur-sm border-b border-border overflow-hidden">
      <div className="flex animate-ticker">
        {doubledData.map((item, index) => (
          <div
            key={`${item.teams}-${index}`}
            className="flex items-center gap-3 px-6 py-2 border-r border-border whitespace-nowrap"
          >
            <span className="text-lg">{item.symbol}</span>
            <span className="text-xs text-muted-foreground">{item.teams}</span>
            <span className="text-sm font-medium text-foreground">{item.odds}</span>
            <span
              className={`flex items-center gap-1 text-xs ${
                item.change >= 0 ? "text-success" : "text-destructive"
              }`}
            >
              {item.change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {item.change >= 0 ? "+" : ""}{item.change}%
            </span>
            <span className="text-xs text-muted-foreground">{item.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TickerBar;
