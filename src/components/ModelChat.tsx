import { useState } from "react";
import { ChevronDown, ChevronUp, Sparkles, Bot, Loader2, Zap } from "lucide-react";
import { usePredictions, analyzePrediction } from "@/hooks/usePredictions";
import { useToast } from "@/hooks/use-toast";

const ModelChat = () => {
  const [expandedMessages, setExpandedMessages] = useState<string[]>([]);
  const [analyzingIds, setAnalyzingIds] = useState<string[]>([]);
  const { data: predictions, isLoading, error } = usePredictions();
  const { toast } = useToast();

  const toggleExpand = (id: string) => {
    setExpandedMessages((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const handleAnalyze = async (predictionId: string) => {
    setAnalyzingIds((prev) => [...prev, predictionId]);
    try {
      await analyzePrediction(predictionId);
      toast({
        title: "Analiz Tamamlandı",
        description: "AI analizi başarıyla oluşturuldu",
      });
    } catch (err) {
      toast({
        title: "Hata",
        description: "Analiz oluşturulurken hata oluştu",
        variant: "destructive",
      });
    } finally {
      setAnalyzingIds((prev) => prev.filter((id) => id !== predictionId));
    }
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
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-success rounded-full animate-pulse"></span>
          <span className="text-xs text-muted-foreground">Canlı</span>
        </div>
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

            {/* AI Analysis */}
            {prediction.analysis && (
              <div className="mt-3 p-3 bg-primary/10 border border-primary/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Zap size={14} className="text-primary" />
                  <span className="text-xs font-semibold text-primary">AI ANALİZİ</span>
                </div>
                <p className="text-sm text-foreground leading-relaxed">
                  {prediction.analysis}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-3 mt-3">
              {!prediction.analysis && (
                <button
                  onClick={() => handleAnalyze(prediction.id)}
                  disabled={analyzingIds.includes(prediction.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {analyzingIds.includes(prediction.id) ? (
                    <>
                      <Loader2 size={12} className="animate-spin" />
                      Analiz Ediliyor...
                    </>
                  ) : (
                    <>
                      <Zap size={12} />
                      AI ile Analiz Et
                    </>
                  )}
                </button>
              )}
              
              <button
                onClick={() => toggleExpand(prediction.id)}
                className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
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
            </div>

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
