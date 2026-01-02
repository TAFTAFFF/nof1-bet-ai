import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { predictionId } = await req.json();
    
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the prediction data
    const { data: prediction, error: fetchError } = await supabase
      .from('predictions')
      .select('*')
      .eq('id', predictionId)
      .single();

    if (fetchError || !prediction) {
      throw new Error('Prediction not found: ' + fetchError?.message);
    }

    console.log('Analyzing prediction:', prediction.match_name);

    const prompt = `Sana vereceğim maç ismi ve tahmin için kısa, profesyonel bir bahis analizi yap.

Maç: ${prediction.match_name}
Mevcut Tahmin: ${prediction.prediction}
Model: ${prediction.model_name}

Lütfen:
1. Kısa ve öz bir analiz yap (maksimum 3-4 cümle)
2. Bu tahminin güçlü ve zayıf yönlerini belirt
3. Türkçe yaz

Sadece analiz metnini yaz, başka bir şey ekleme.`;

    // Call Lovable AI Gateway
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'Sen profesyonel bir bahis analistisin. Kısa, öz ve profesyonel analizler yaparsın.' },
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Rate limit aşıldı, lütfen daha sonra tekrar deneyin.');
      }
      if (response.status === 402) {
        throw new Error('Kredi yetersiz, lütfen hesabınıza kredi ekleyin.');
      }
      const errorText = await response.text();
      console.error('AI Gateway error:', errorText);
      throw new Error('AI Gateway error: ' + errorText);
    }

    const aiData = await response.json();
    const analysisText = aiData.choices?.[0]?.message?.content || 'Analiz oluşturulamadı';

    console.log('Analysis generated:', analysisText.substring(0, 100));

    // Update the prediction with analysis
    const { error: updateError } = await supabase
      .from('predictions')
      .update({ analysis: analysisText })
      .eq('id', predictionId);

    if (updateError) {
      throw new Error('Failed to update prediction: ' + updateError.message);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        analysis: analysisText 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in analyze-prediction:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
