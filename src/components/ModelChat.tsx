import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Sparkles, Bot, Loader2, Zap, Target, TrendingUp, AlertCircle } from "lucide-react";
import { usePredictions, analyzePrediction } from "@/hooks/usePredictions";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const ModelChat = () => {
  const [expandedMessages, setExpandedMessages] = useState<string[]>([]);
  const [analyzingIds, setAnalyzingIds] = useState<string[]>([]);
  const { data: predictions, isLoading, error } = usePredictions();
  const { toast } = useToast();

  // Real-time subscription for updates
  useEffect(() => {
    const channel = supabase
      .channel('predictions-live')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'predictions'
        },
        () => {
          // Invalidation handled in usePredictions hook
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

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
    if (modelName.includes("StatMaster") || modelName.includes("AI Auto")) return "text-secondary";
    if (modelName.includes("OddsOracle")) return "text-accent";
    if (modelName.includes("BetGenius")) return "text-primary";
    return "text-primary";
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
          <div className="flex flex-col items-center justify-center p-8">
            <Loader2 className="animate-spin text-primary" size={24} />
            <span className="mt-2 text-sm text-muted-foreground">Veriler yükleniyor...</span>
          </div>
        )}
        
        {error && (
          <div className="p-4 text-center">
            <AlertCircle className="mx-auto mb-2 text-destructive" size={24} />
            <p className="text-destructive">Veriler yüklenirken hata oluştu</p>
          </div>
        )}

        {!isLoading && !error && predictions?.length === 0 && (
          <div className="p-8 text-center">
            <Bot className="mx-auto mb-3 text-muted-foreground" size={32} />
            <p className="text-muted-foreground">Henüz tahmin yok</p>
            <p className="text-xs text-muted-foreground mt-1">
              "Maçları Güncelle" butonuna tıklayarak başlayın
            </p>
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
              {prediction.league_name && (
                <span className="text-xs text-muted-foreground">
                  • {prediction.league_name}
                </span>
              )}
            </div>

            {/* Prediction Details */}
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="text-xs font-medium px-2 py-1 rounded bg-success/20 text-success flex items-center gap-1">
                <Target size={10} />
                {prediction.prediction}
              </span>
              <span className="text-xs px-2 py-1 rounded bg-primary/20 text-primary flex items-center gap-1">
                <TrendingUp size={10} />
                %{prediction.confidence_score} güven
              </span>
              {prediction.win_probability && (
                <span className="text-xs px-2 py-1 rounded bg-accent/20 text-accent">
                  Kazanma: %{prediction.win_probability}
                </span>
              )}
              {prediction.score_prediction && (
                <span className="text-xs px-2 py-1 rounded bg-secondary/20 text-secondary font-mono">
                  Skor: {prediction.score_prediction}
                </span>
              )}
            </div>

            {/* Reasoning */}
            {prediction.reasoning && (
              <div className="mt-2 p-2 bg-muted/30 border border-border/50 rounded text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">Düşünce Süreci: </span>
                {prediction.reasoning}
              </div>
            )}

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
              <div className="mt-2 text-xs text-muted-foreground bg-muted/50 p-3 rounded space-y-1">
                <p><strong>Model:</strong> {prediction.model_name}</p>
                <p><strong>Güven:</strong> %{prediction.confidence_score}</p>
                {prediction.win_probability && (
                  <p><strong>Kazanma Olasılığı:</strong> %{prediction.win_probability}</p>
                )}
                {prediction.score_prediction && (
                  <p><strong>Skor Tahmini:</strong> {prediction.score_prediction}</p>
                )}
                {prediction.home_team && prediction.away_team && (
                  <p><strong>Takımlar:</strong> {prediction.home_team} vs {prediction.away_team}</p>
                )}
                {prediction.match_date && (
                  <p><strong>Maç Tarihi:</strong> {new Date(prediction.match_date).toLocaleDateString('tr-TR')}</p>
                )}
                <p><strong>Oluşturulma:</strong> {formatDate(prediction.created_at)}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ModelChat;