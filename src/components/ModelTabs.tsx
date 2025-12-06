import { useState } from "react";

interface Model {
  id: string;
  name: string;
  strategy: string;
}

const models: Model[] = [
  { id: "aggregate", name: "Toplam Endeks", strategy: "Tüm modellerin ortalaması" },
  { id: "conservative", name: "1: Güvenli Oyun", strategy: "Düşük riskli bahisler" },
  { id: "underdog", name: "2: Sürpriz Avcısı", strategy: "Yüksek oranlı tahminler" },
  { id: "stats", name: "3: İstatistik Uzmanı", strategy: "Veri odaklı analiz" },
  { id: "aggressive", name: "4: Agresif Strateji", strategy: "Yüksek risk, yüksek kazanç" },
];

interface ModelTabsProps {
  onSelect?: (modelId: string) => void;
}

const ModelTabs = ({ onSelect }: ModelTabsProps) => {
  const [activeModel, setActiveModel] = useState("aggregate");

  const handleSelect = (modelId: string) => {
    setActiveModel(modelId);
    onSelect?.(modelId);
  };

  return (
    <div className="flex flex-wrap gap-2 p-4 bg-card border-b border-border">
      {models.map((model) => (
        <button
          key={model.id}
          onClick={() => handleSelect(model.id)}
          className={`px-4 py-2 text-sm rounded transition-all ${
            activeModel === model.id
              ? "bg-primary text-primary-foreground box-glow-primary"
              : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
          }`}
        >
          {model.name}
        </button>
      ))}
    </div>
  );
};

export default ModelTabs;
