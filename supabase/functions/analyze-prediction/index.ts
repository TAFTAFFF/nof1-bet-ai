import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
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

    // Call Gemini API
    const prompt = `Sana vereceğim maç ismi ve tahmin için kısa, profesyonel bir bahis analizi yap.

Maç: ${prediction.match_name}
Mevcut Tahmin: ${prediction.prediction}
Model: ${prediction.model_name}

Lütfen:
1. Kısa ve öz bir analiz yap (maksimum 3-4 cümle)
2. Bu tahminin güçlü ve zayıf yönlerini belirt
3. Türkçe yaz

Sadece analiz metnini yaz, başka bir şey ekleme.`;

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500,
          }
        }),
      }
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error('Gemini API error:', errorText);
      throw new Error('Gemini API error: ' + errorText);
    }

    const geminiData = await geminiResponse.json();
    const analysisText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || 'Analiz oluşturulamadı';

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
