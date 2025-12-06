import { useState } from "react";

interface Model {
  id: string;
  name: string;
  strategy: string;
}

const models: Model[] = [
  { id: "aggregate", name: "Toplam Endeks", strategy: "Tüm modellerin ortalaması" },
  { id: "baseline", name: "1: Yeni Temel", strategy: "Muhafazakâr strateji" },
  { id: "monk", name: "2: Monk Modu", strategy: "Sabırlı ve düşük risk" },
  { id: "awareness", name: "3: Durumsal Farkındalık", strategy: "Piyasa analizi" },
  { id: "leverage", name: "4: Maksimum Kaldıraç", strategy: "Agresif strateji" },
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
