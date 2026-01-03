import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AutomationLog {
  function_name: string;
  status: 'started' | 'success' | 'error';
  message?: string;
  matches_processed?: number;
  analyses_generated?: number;
  error_details?: string;
  execution_time_ms?: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Helper to log automation status
  const logAutomation = async (log: AutomationLog) => {
    try {
      await supabase.from('automation_logs').insert({
        ...log,
        execution_time_ms: Date.now() - startTime
      });
    } catch (e) {
      console.error('Failed to log automation:', e);
    }
  };

  try {
    const rapidApiKey = Deno.env.get('RAPIDAPI_KEY');
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

    if (!rapidApiKey) {
      await logAutomation({
        function_name: 'fetch-matches',
        status: 'error',
        error_details: 'RAPIDAPI_KEY is not configured'
      });
      throw new Error('RAPIDAPI_KEY is not configured');
    }

    if (!lovableApiKey) {
      await logAutomation({
        function_name: 'fetch-matches',
        status: 'error',
        error_details: 'LOVABLE_API_KEY is not configured'
      });
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Log start
    await logAutomation({
      function_name: 'fetch-matches',
      status: 'started',
      message: 'Maç verisi çekme işlemi başladı'
    });

    console.log('=== FETCH MATCHES STARTED ===');

    // Clean up old finished matches (older than 2 days)
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    
    const { data: oldPredictions } = await supabase
      .from('predictions')
      .select('id')
      .lt('created_at', twoDaysAgo.toISOString());
    
    const deletedCount = oldPredictions?.length || 0;
    
    if (deletedCount > 0) {
      await supabase
        .from('predictions')
        .delete()
        .lt('created_at', twoDaysAgo.toISOString());
      
      console.log(`Cleaned up ${deletedCount} old predictions`);
    }

    // Fetch today's scheduled football events
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    console.log(`Fetching matches for: ${dateStr}`);
    
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
      await logAutomation({
        function_name: 'fetch-matches',
        status: 'error',
        error_details: `RapidAPI error: ${matchesResponse.status} - ${errorText}`
      });
      throw new Error(`RapidAPI error: ${matchesResponse.status}`);
    }

    const matchesData = await matchesResponse.json();
    const events = matchesData.events || [];
    console.log(`Total matches fetched: ${events.length}`);

    // Filter for important leagues
    const importantLeagues = [
      'Premier League', 'La Liga', 'Serie A', 'Bundesliga', 'Ligue 1',
      'Süper Lig', 'Champions League', 'Europa League', 'Conference League',
      'Championship', 'Eredivisie', 'Primeira Liga', 'MLS'
    ];

    const filteredEvents = events.filter((event: any) => {
      const leagueName = event.tournament?.name || '';
      return importantLeagues.some(league => 
        leagueName.toLowerCase().includes(league.toLowerCase())
      );
    });

    console.log(`Filtered to ${filteredEvents.length} important matches`);

    const processedMatches: string[] = [];
    const newPredictions: any[] = [];
    let analysesGenerated = 0;

    // Process each match
    for (const event of filteredEvents.slice(0, 15)) {
      const homeTeam = event.homeTeam?.name || 'Unknown';
      const awayTeam = event.awayTeam?.name || 'Unknown';
      const matchName = `${homeTeam} vs ${awayTeam}`;
      const eventId = String(event.id);
      const leagueName = event.tournament?.name || 'Unknown League';
      const matchDate = event.startTimestamp 
        ? new Date(event.startTimestamp * 1000).toISOString().split('T')[0]
        : dateStr;

      // Check for duplicate using unique event ID
      const { data: existingPrediction } = await supabase
        .from('predictions')
        .select('id, api_event_id')
        .eq('api_event_id', eventId)
        .maybeSingle();

      if (existingPrediction) {
        console.log(`Match already exists (ID: ${eventId}): ${matchName}`);
        continue;
      }

      // Also check by match name for backward compatibility
      const { data: existingByName } = await supabase
        .from('predictions')
        .select('id')
        .eq('match_name', matchName)
        .eq('match_date', matchDate)
        .maybeSingle();

      if (existingByName) {
        console.log(`Match already exists by name: ${matchName}`);
        continue;
      }

      console.log(`Processing new match: ${matchName} (${leagueName})`);

      // Fetch additional data for better analysis
      let teamContext = '';
      try {
        // Get home team form
        if (event.homeTeam?.id) {
          const homeFormResponse = await fetch(
            `https://sportapi7.p.rapidapi.com/api/v1/team/${event.homeTeam.id}/form/football`,
            {
              method: 'GET',
              headers: {
                'X-RapidAPI-Key': rapidApiKey,
                'X-RapidAPI-Host': 'sportapi7.p.rapidapi.com',
              },
            }
          );
          if (homeFormResponse.ok) {
            const homeFormData = await homeFormResponse.json();
            const form = homeFormData.form?.slice(0, 5).map((f: any) => f.type).join('') || 'N/A';
            teamContext += `\n${homeTeam} son 5 maç formu: ${form}`;
          }
        }

        // Get away team form
        if (event.awayTeam?.id) {
          const awayFormResponse = await fetch(
            `https://sportapi7.p.rapidapi.com/api/v1/team/${event.awayTeam.id}/form/football`,
            {
              method: 'GET',
              headers: {
                'X-RapidAPI-Key': rapidApiKey,
                'X-RapidAPI-Host': 'sportapi7.p.rapidapi.com',
              },
            }
          );
          if (awayFormResponse.ok) {
            const awayFormData = await awayFormResponse.json();
            const form = awayFormData.form?.slice(0, 5).map((f: any) => f.type).join('') || 'N/A';
            teamContext += `\n${awayTeam} son 5 maç formu: ${form}`;
          }
        }

        // Add a small delay between API calls
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (e) {
        console.log('Could not fetch additional team data:', e);
      }

      // Generate AI analysis with Chain of Thought prompting
      const prompt = `Profesyonel bir futbol analisti olarak, aşağıdaki maç için detaylı bir bahis analizi yap.

## MAÇ BİLGİLERİ
- Maç: ${matchName}
- Lig: ${leagueName}
- Tarih: ${matchDate}
${teamContext}

## ANALİZ TALİMATLARI (Chain of Thought)

Adım adım düşün:

1. **TAKIM ANALİZİ**: Her iki takımın güçlü ve zayıf yönlerini değerlendir.
2. **FORM DURUMU**: Son maçlardaki performanslarını incele.
3. **İSTATİSTİKSEL DEĞERLENDİRME**: Gol beklentisi, defans gücü analizi.
4. **KARAR VERME**: Tüm faktörleri tartarak mantıksal sonuca ulaş.

## ÇIKTI FORMATI (Bu formatı kesinlikle takip et)

REASONING: [Adım adım düşünme sürecin, 3-4 cümle]

ANALYSIS: [Kısa ve öz maç analizi, 2-3 cümle]

PREDICTION: [Tam olarak şunlardan biri: "Ev sahibi kazanır", "Beraberlik", "Deplasman kazanır", "Karşılıklı gol var", "2.5 üst"]

SCORE: [Tahmini skor, örn: "2-1"]

CONFIDENCE: [0-100 arası bir sayı]

WIN_PROBABILITY: [Ev sahibi kazanma yüzdesi, 0-100]`;

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
              { 
                role: 'system', 
                content: `Sen dünya çapında tanınmış bir futbol analistisin. 
                
Analiz yaparken:
- Chain of Thought (adım adım düşünme) tekniğini kullan
- Her kararın arkasındaki mantığı açıkla
- İstatistikleri ve form durumunu göz önünde bulundur
- Belirsizlik durumlarında bunu belirt

Her zaman Türkçe yanıt ver ve verilen formata kesinlikle uy.` 
              },
              { role: 'user', content: prompt }
            ],
          }),
        });

        if (!aiResponse.ok) {
          if (aiResponse.status === 429) {
            console.log('Rate limit hit, waiting 3 seconds...');
            await new Promise(resolve => setTimeout(resolve, 3000));
            continue;
          }
          if (aiResponse.status === 402) {
            console.log('Credits exhausted, stopping...');
            break;
          }
          throw new Error(`AI error: ${aiResponse.status}`);
        }

        const aiData = await aiResponse.json();
        const responseText = aiData.choices?.[0]?.message?.content || '';

        console.log('AI Response preview:', responseText.substring(0, 200));

        // Parse the enhanced response
        const reasoningMatch = responseText.match(/REASONING:\s*(.+?)(?=ANALYSIS:|$)/s);
        const analysisMatch = responseText.match(/ANALYSIS:\s*(.+?)(?=PREDICTION:|$)/s);
        const predictionMatch = responseText.match(/PREDICTION:\s*(.+?)(?=SCORE:|$)/s);
        const scoreMatch = responseText.match(/SCORE:\s*(.+?)(?=CONFIDENCE:|$)/s);
        const confidenceMatch = responseText.match(/CONFIDENCE:\s*(\d+)/);
        const winProbMatch = responseText.match(/WIN_PROBABILITY:\s*(\d+)/);

        const reasoning = reasoningMatch?.[1]?.trim() || '';
        const analysis = analysisMatch?.[1]?.trim() || responseText.substring(0, 500);
        const prediction = predictionMatch?.[1]?.trim() || 'Analiz yapıldı';
        const scorePrediction = scoreMatch?.[1]?.trim() || '';
        const confidenceScore = parseInt(confidenceMatch?.[1] || '70', 10);
        const winProbability = parseInt(winProbMatch?.[1] || '50', 10);

        newPredictions.push({
          match_name: matchName,
          prediction: prediction,
          confidence_score: Math.min(100, Math.max(0, confidenceScore)),
          model_name: 'Gemini 2.5 Flash (CoT)',
          analysis: analysis,
          api_event_id: eventId,
          league_name: leagueName,
          home_team: homeTeam,
          away_team: awayTeam,
          match_date: matchDate,
          reasoning: reasoning,
          score_prediction: scorePrediction,
          win_probability: Math.min(100, Math.max(0, winProbability)),
          last_updated: new Date().toISOString()
        });

        processedMatches.push(matchName);
        analysesGenerated++;
        console.log(`✓ Analysis generated for: ${matchName} (Confidence: ${confidenceScore}%)`);

        // Delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 800));
      } catch (aiError) {
        console.error(`AI analysis failed for ${matchName}:`, aiError);
        // Still add the match without full analysis
        newPredictions.push({
          match_name: matchName,
          prediction: 'Analiz bekleniyor',
          confidence_score: 50,
          model_name: 'Pending',
          analysis: 'AI analizi başarısız oldu, yeniden denenecek.',
          api_event_id: eventId,
          league_name: leagueName,
          home_team: homeTeam,
          away_team: awayTeam,
          match_date: matchDate,
          last_updated: new Date().toISOString()
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
        await logAutomation({
          function_name: 'fetch-matches',
          status: 'error',
          error_details: `Database insert error: ${insertError.message}`,
          matches_processed: processedMatches.length,
          analyses_generated: analysesGenerated
        });
        throw insertError;
      }
      console.log(`✓ Inserted ${newPredictions.length} new predictions`);
    }

    // Log success
    await logAutomation({
      function_name: 'fetch-matches',
      status: 'success',
      message: `${processedMatches.length} maç işlendi, ${analysesGenerated} analiz oluşturuldu`,
      matches_processed: processedMatches.length,
      analyses_generated: analysesGenerated
    });

    console.log('=== FETCH MATCHES COMPLETED ===');

    return new Response(
      JSON.stringify({
        success: true,
        message: `${processedMatches.length} yeni maç işlendi, ${analysesGenerated} analiz oluşturuldu`,
        matches: processedMatches,
        deletedOldMatches: deletedCount || 0
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in fetch-matches:', error);
    
    await logAutomation({
      function_name: 'fetch-matches',
      status: 'error',
      error_details: error instanceof Error ? error.message : 'Unknown error'
    });

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
