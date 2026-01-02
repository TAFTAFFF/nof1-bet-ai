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
    const rapidApiKey = Deno.env.get('RAPIDAPI_KEY');
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!rapidApiKey) {
      throw new Error('RAPIDAPI_KEY is not configured');
    }

    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Fetching football matches from RapidAPI...');

    // Fetch today's scheduled football events
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    const matchesResponse = await fetch(
      `https://sportapi7.p.rapidapi.com/api/v1/sport/football/scheduled-events/${dateStr}`,
      {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': rapidApiKey,
          'X-RapidAPI-Host': 'sportapi7.p.rapidapi.com',
        },
      }
    );

    if (!matchesResponse.ok) {
      const errorText = await matchesResponse.text();
      console.error('RapidAPI error:', matchesResponse.status, errorText);
      throw new Error(`RapidAPI error: ${matchesResponse.status}`);
    }

    const matchesData = await matchesResponse.json();
    console.log('Matches fetched:', matchesData.events?.length || 0);

    const events = matchesData.events || [];
    const processedMatches: string[] = [];
    const newPredictions: any[] = [];

    // Process each match
    for (const event of events.slice(0, 10)) { // Limit to 10 matches to avoid rate limits
      const homeTeam = event.homeTeam?.name || 'Unknown';
      const awayTeam = event.awayTeam?.name || 'Unknown';
      const matchName = `${homeTeam} vs ${awayTeam}`;

      // Check if this match already exists in predictions
      const { data: existingPrediction } = await supabase
        .from('predictions')
        .select('id')
        .eq('match_name', matchName)
        .single();

      if (existingPrediction) {
        console.log(`Match already exists: ${matchName}`);
        continue;
      }

      console.log(`Processing new match: ${matchName}`);

      // Generate AI analysis using Lovable AI
      const prompt = `Sana vereceğim futbol maçı için kısa, profesyonel bir bahis analizi yap.

Maç: ${matchName}
Tarih: ${dateStr}

Lütfen şu formatta yanıt ver:
1. Kısa analiz (2-3 cümle)
2. Tahmin (örn: "Ev sahibi kazanır", "Beraberlik", "Deplasman kazanır", "Karşılıklı gol var")
3. Güven skoru (0-100 arası bir sayı)

Format:
ANALIZ: [analiz metni]
TAHMIN: [tahmin]
GUVEN: [sayı]`;

      try {
        const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${lovableApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [
              { role: 'system', content: 'Sen profesyonel bir futbol analistisin. Kısa, öz ve profesyonel analizler yaparsın.' },
              { role: 'user', content: prompt }
            ],
          }),
        });

        if (!aiResponse.ok) {
          if (aiResponse.status === 429) {
            console.log('Rate limit hit, waiting...');
            await new Promise(resolve => setTimeout(resolve, 2000));
            continue;
          }
          throw new Error(`AI error: ${aiResponse.status}`);
        }

        const aiData = await aiResponse.json();
        const responseText = aiData.choices?.[0]?.message?.content || '';

        // Parse the response
        const analysisMatch = responseText.match(/ANALIZ:\s*(.+?)(?=TAHMIN:|$)/s);
        const predictionMatch = responseText.match(/TAHMIN:\s*(.+?)(?=GUVEN:|$)/s);
        const confidenceMatch = responseText.match(/GUVEN:\s*(\d+)/);

        const analysis = analysisMatch?.[1]?.trim() || responseText;
        const prediction = predictionMatch?.[1]?.trim() || 'Analiz yapıldı';
        const confidenceScore = parseInt(confidenceMatch?.[1] || '70', 10);

        newPredictions.push({
          match_name: matchName,
          prediction: prediction,
          confidence_score: Math.min(100, Math.max(0, confidenceScore)),
          model_name: 'AI Auto',
          analysis: analysis,
        });

        processedMatches.push(matchName);
        console.log(`Analysis generated for: ${matchName}`);

        // Small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (aiError) {
        console.error(`AI analysis failed for ${matchName}:`, aiError);
        // Still add the match without analysis
        newPredictions.push({
          match_name: matchName,
          prediction: 'Analiz bekleniyor',
          confidence_score: 50,
          model_name: 'AI Auto',
          analysis: null,
        });
        processedMatches.push(matchName);
      }
    }

    // Insert all new predictions
    if (newPredictions.length > 0) {
      const { error: insertError } = await supabase
        .from('predictions')
        .insert(newPredictions);

      if (insertError) {
        console.error('Insert error:', insertError);
        throw insertError;
      }
      console.log(`Inserted ${newPredictions.length} new predictions`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `${processedMatches.length} yeni maç işlendi`,
        matches: processedMatches,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in fetch-matches:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
