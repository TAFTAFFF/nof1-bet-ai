import { useState } from "react";
import { ChevronDown, ChevronUp, Sparkles, Bot, Loader2 } from "lucide-react";
import { usePredictions } from "@/hooks/usePredictions";

const ModelChat = () => {
  const [expandedMessages, setExpandedMessages] = useState<string[]>([]);
  const { data: predictions, isLoading, error } = usePredictions();

  const toggleExpand = (id: string) => {
    setExpandedMessages((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const getModelColor = (modelName: string) => {
    if (modelName.includes("Mystery")) return "text-destructive";
    if (modelName.includes("StatMaster")) return "text-secondary";
    if (modelName.includes("OddsOracle")) return "text-accent";
    if (modelName.includes("BetGenius")) return "text-primary";
    return "text-foreground";
  };

  const getSportEmoji = (matchName: string) => {
    const basketballKeywords = ["Lakers", "Celtics", "Warriors", "Nuggets", "Efes", "Beko", "NBA"];
    return basketballKeywords.some(k => matchName.includes(k)) ? "🏀" : "⚽";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("tr-TR", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Bot className="text-primary" size={20} />
          <span className="font-display font-semibold text-foreground">MODEL TAHMİNLERİ</span>
        </div>
        <span className="text-xs text-muted-foreground">Veritabanından</span>
      </div>

      {/* Messages */}
      <div className="max-h-[500px] overflow-y-auto scrollbar-hide">
        {isLoading && (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="animate-spin text-primary" size={24} />
          </div>
        )}
        
        {error && (
          <div className="p-4 text-center text-destructive">
            Veriler yüklenirken hata oluştu
          </div>
        )}

        {predictions?.map((prediction) => (
          <div
            key={prediction.id}
            className="border-b border-border p-4 hover:bg-muted/30 transition-colors animate-slide-up"
          >
            {/* Message Header */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <Sparkles size={14} className={getModelColor(prediction.model_name)} />
                <span className={`font-semibold ${getModelColor(prediction.model_name)}`}>
                  {prediction.model_name}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">{formatDate(prediction.created_at)}</span>
            </div>

            {/* Prediction Badge */}
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-lg">{getSportEmoji(prediction.match_name)}</span>
              <span className="text-xs font-medium text-foreground bg-muted px-2 py-1 rounded">
                {prediction.match_name}
              </span>
              <span className="text-xs font-medium px-2 py-1 rounded bg-success/20 text-success">
                {prediction.prediction}
              </span>
              <span className="text-xs text-muted-foreground">
                %{prediction.confidence_score} güven
              </span>
            </div>

            {/* Expand Button */}
            <button
              onClick={() => toggleExpand(prediction.id)}
              className="flex items-center gap-1 mt-2 text-xs text-primary hover:text-primary/80 transition-colors"
            >
              {expandedMessages.includes(prediction.id) ? (
                <>
                  <ChevronUp size={14} /> Daralt
                </>
              ) : (
                <>
                  <ChevronDown size={14} /> Detaylar
                </>
              )}
            </button>

            {expandedMessages.includes(prediction.id) && (
              <div className="mt-2 text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                <p>Model: {prediction.model_name}</p>
                <p>Güven: %{prediction.confidence_score}</p>
                <p>Tarih: {formatDate(prediction.created_at)}</p>
              </div>
            )}
          </div>
        ))}

        {predictions?.length === 0 && !isLoading && (
          <div className="p-4 text-center text-muted-foreground">
            Henüz tahmin yok
          </div>
        )}
      </div>
    </div>
  );
};

export default ModelChat;
