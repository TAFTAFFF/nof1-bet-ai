import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, CheckCircle, XCircle, Clock, Activity, Database, Brain } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

interface AutomationLog {
  id: string;
  function_name: string;
  status: 'started' | 'success' | 'error';
  message: string | null;
  matches_processed: number | null;
  analyses_generated: number | null;
  error_details: string | null;
  execution_time_ms: number | null;
  created_at: string;
}

export const AutomationStatusPanel = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: logs, isLoading, refetch } = useQuery({
    queryKey: ['automation-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('automation_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data as AutomationLog[];
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: stats } = useQuery({
    queryKey: ['predictions-stats'],
    queryFn: async () => {
      const { data, error, count } = await supabase
        .from('predictions')
        .select('*', { count: 'exact', head: true });

      if (error) throw error;

      const { data: recentData } = await supabase
        .from('predictions')
        .select('created_at')
        .order('created_at', { ascending: false })
        .limit(1);

      return {
        totalPredictions: count || 0,
        lastUpdate: recentData?.[0]?.created_at || null
      };
    },
    refetchInterval: 30000,
  });

  const handleManualRun = async () => {
    setIsRefreshing(true);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-matches');
      
      if (error) throw error;
      
      toast.success(`Başarılı: ${data?.message || 'Maçlar güncellendi'}`);
      refetch();
    } catch (error: any) {
      toast.error(`Hata: ${error.message}`);
    } finally {
      setIsRefreshing(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'started':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Activity className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">Başarılı</Badge>;
      case 'error':
        return <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">Hata</Badge>;
      case 'started':
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Çalışıyor</Badge>;
      default:
        return <Badge variant="outline">Bilinmiyor</Badge>;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };

  const lastSuccessfulRun = logs?.find(log => log.status === 'success');

  return (
    <Card className="bg-card/50 backdrop-blur border-border/50">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Otomasyon Durum Paneli
        </CardTitle>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleManualRun}
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Manuel Çalıştır
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-background/50 rounded-lg p-3 border border-border/30">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <Database className="h-3 w-3" />
              Toplam Tahmin
            </div>
            <div className="text-2xl font-bold text-foreground">
              {stats?.totalPredictions || 0}
            </div>
          </div>
          
          <div className="bg-background/50 rounded-lg p-3 border border-border/30">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <Brain className="h-3 w-3" />
              Son Güncelleme
            </div>
            <div className="text-sm font-medium text-foreground">
              {stats?.lastUpdate 
                ? formatDate(stats.lastUpdate)
                : 'Henüz yok'}
            </div>
          </div>
          
          <div className="bg-background/50 rounded-lg p-3 border border-border/30">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <CheckCircle className="h-3 w-3" />
              Son Başarılı
            </div>
            <div className="text-sm font-medium text-foreground">
              {lastSuccessfulRun 
                ? formatDate(lastSuccessfulRun.created_at)
                : 'Henüz yok'}
            </div>
          </div>
          
          <div className="bg-background/50 rounded-lg p-3 border border-border/30">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <Activity className="h-3 w-3" />
              İşlenen Maç
            </div>
            <div className="text-2xl font-bold text-foreground">
              {lastSuccessfulRun?.matches_processed || 0}
            </div>
          </div>
        </div>

        {/* Log History */}
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-3">Son İşlemler</h4>
          
          {isLoading ? (
            <div className="text-center text-muted-foreground py-4">Yükleniyor...</div>
          ) : logs && logs.length > 0 ? (
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {logs.map((log) => (
                <div 
                  key={log.id}
                  className="flex items-center justify-between p-3 bg-background/30 rounded-lg border border-border/20 hover:bg-background/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(log.status)}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">
                          {log.function_name}
                        </span>
                        {getStatusBadge(log.status)}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {log.message || log.error_details || 'İşlem kaydı'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">
                      {formatDate(log.created_at)}
                    </div>
                    {log.execution_time_ms && (
                      <div className="text-xs text-muted-foreground">
                        {(log.execution_time_ms / 1000).toFixed(1)}s
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-4">
              Henüz log kaydı yok. Manuel çalıştırarak başlayın.
            </div>
          )}
        </div>

        {/* AI Model Info */}
        <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
          <h4 className="text-sm font-medium text-primary mb-2 flex items-center gap-2">
            <Brain className="h-4 w-4" />
            AI Model Bilgisi
          </h4>
          <div className="text-xs text-muted-foreground space-y-1">
            <p><strong>Model:</strong> Google Gemini 2.5 Flash</p>
            <p><strong>Teknik:</strong> Chain of Thought (Adım Adım Düşünme)</p>
            <p><strong>Özellikler:</strong> Form analizi, skor tahmini, güven skoru, kazanma olasılığı</p>
            <p><strong>Otomasyon:</strong> Her gün 08:00'de otomatik çalışır</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
