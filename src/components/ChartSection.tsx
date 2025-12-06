import { useState } from "react";
import { XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";

const generateChartData = () => {
  const data = [];
  let value = 1000;
  const days = 30;
  
  for (let i = 0; i < days; i++) {
    const change = (Math.random() - 0.4) * 80;
    value += change;
    data.push({
      day: `Gün ${i + 1}`,
      value: Math.round(value),
      date: new Date(2025, 10, i + 1).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' }),
    });
  }
  return data;
};

const chartData = generateChartData();

const ChartSection = () => {
  const [timeRange, setTimeRange] = useState<"ALL" | "72H">("ALL");

  const startValue = chartData[0].value;
  const endValue = chartData[chartData.length - 1].value;
  const percentChange = ((endValue - startValue) / startValue * 100).toFixed(2);
  const isPositive = endValue >= startValue;

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div>
          <h3 className="font-display font-semibold text-foreground">TOPLAM BAHİS PERFORMANSI</h3>
          <p className="text-sm text-muted-foreground mt-1">
            AI Arena Sezon 1'deki tüm futbol ve basketbol tahminlerinin toplam performansı
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTimeRange("ALL")}
            className={`px-3 py-1 text-sm rounded transition-colors ${
              timeRange === "ALL"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            TÜMÜ
          </button>
          <button
            onClick={() => setTimeRange("72H")}
            className={`px-3 py-1 text-sm rounded transition-colors ${
              timeRange === "72H"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            72S
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="flex items-center gap-6 px-4 py-3 bg-muted/30 border-b border-border flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Toplam Getiri:</span>
          <span className={`font-mono font-bold ${isPositive ? "text-success" : "text-destructive"}`}>
            {isPositive ? "+" : ""}{percentChange}%
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Kazanan:</span>
          <span className="font-mono font-bold text-accent">Mystery Model</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Toplam Birim:</span>
          <span className="font-mono font-bold text-foreground">{endValue.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Maç Sayısı:</span>
          <span className="font-mono font-bold text-secondary">324</span>
        </div>
      </div>

      {/* Chart */}
      <div className="p-4 h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(142, 76%, 50%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(142, 76%, 50%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(0, 0%, 60%)", fontSize: 10 }}
              interval="preserveStartEnd"
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(0, 0%, 60%)", fontSize: 10 }}
              domain={["dataMin - 50", "dataMax + 50"]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(0, 0%, 6%)",
                border: "1px solid hsl(0, 0%, 15%)",
                borderRadius: "4px",
                color: "hsl(0, 0%, 95%)",
                fontSize: "12px",
              }}
              labelStyle={{ color: "hsl(0, 0%, 60%)" }}
              formatter={(value: number) => [`${value.toLocaleString()} birim`, "Değer"]}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="hsl(142, 76%, 50%)"
              strokeWidth={2}
              fill="url(#colorValue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ChartSection;
