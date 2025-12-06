import { TrendingUp, TrendingDown } from "lucide-react";

interface TickerItem {
  symbol: string;
  name: string;
  price: string;
  change: number;
  type: "stock" | "match";
}

const tickerData: TickerItem[] = [
  { symbol: "TSLA", name: "Tesla", price: "$454.68", change: 2.34, type: "stock" },
  { symbol: "GS-FB", name: "Galatasaray vs Fenerbahçe", price: "1.85", change: -5.2, type: "match" },
  { symbol: "NVDA", name: "Nvidia", price: "$182.27", change: 1.56, type: "stock" },
  { symbol: "BJK-TRB", name: "Beşiktaş vs Trabzon", price: "2.10", change: 3.1, type: "match" },
  { symbol: "MSFT", name: "Microsoft", price: "$482.38", change: -0.45, type: "stock" },
  { symbol: "RM-BAR", name: "Real Madrid vs Barcelona", price: "1.95", change: 8.2, type: "match" },
  { symbol: "NDX", name: "Nasdaq 100", price: "$25,677.50", change: 0.89, type: "stock" },
  { symbol: "MCI-LIV", name: "Man City vs Liverpool", price: "2.25", change: -2.1, type: "match" },
  { symbol: "GOOGL", name: "Google", price: "$320.52", change: 1.23, type: "stock" },
  { symbol: "PSG-BAY", name: "PSG vs Bayern", price: "2.40", change: 4.5, type: "match" },
];

const TickerBar = () => {
  const doubledData = [...tickerData, ...tickerData];

  return (
    <div className="fixed top-16 left-0 right-0 z-40 bg-card/90 backdrop-blur-sm border-b border-border overflow-hidden">
      <div className="flex animate-ticker">
        {doubledData.map((item, index) => (
          <div
            key={`${item.symbol}-${index}`}
            className="flex items-center gap-3 px-6 py-2 border-r border-border whitespace-nowrap"
          >
            <div className={`w-2 h-2 rounded-full ${item.type === "match" ? "bg-secondary" : "bg-primary"}`} />
            <span className="text-xs text-muted-foreground">{item.symbol}</span>
            <span className="text-sm font-medium text-foreground">{item.price}</span>
            <span
              className={`flex items-center gap-1 text-xs ${
                item.change >= 0 ? "text-success" : "text-destructive"
              }`}
            >
              {item.change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {item.change >= 0 ? "+" : ""}{item.change}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TickerBar;
