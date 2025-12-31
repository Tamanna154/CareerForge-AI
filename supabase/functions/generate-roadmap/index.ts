import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { goal, goalType, experienceLevel } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Generating roadmap for:', { goal, goalType, experienceLevel });

    const prompt = `You are an expert career and learning advisor. Generate a detailed learning roadmap for the following:

Goal: ${goal}
Goal Type: ${goalType}
Experience Level: ${experienceLevel}

Create a comprehensive roadmap with 5-7 phases. For each phase, provide:
1. Phase title
2. Duration (in weeks)
3. Description (2-3 sentences)
4. 4-6 specific topics/skills to learn
5. 3-4 FREE recommended resources (courses, books, websites) - ONLY include free resources from platforms like:
   - freeCodeCamp, Khan Academy, Coursera (free courses), edX (audit mode)
   - YouTube channels, MDN Web Docs, W3Schools
   - Official documentation, GitHub repositories, free eBooks
   - GeeksforGeeks, LeetCode (free tier), HackerRank
6. A milestone to achieve at the end of this phase

IMPORTANT: Return ONLY valid JSON in this exact format, no markdown or extra text:
{
  "title": "Roadmap title",
  "summary": "Brief overview of the learning path",
  "totalDuration": "Total estimated time",
  "phases": [
    {
      "id": 1,
      "title": "Phase title",
      "duration": "X weeks",
      "description": "Phase description",
      "topics": ["topic1", "topic2", "topic3", "topic4"],
      "resources": [
        {"name": "Resource name", "type": "course/book/website/video", "url": "https://actual-url.com", "isFree": true}
      ],
      "milestone": "What you should be able to do after this phase"
    }
  ],
  "freeResources": [
    {"name": "Top free resource", "type": "platform", "url": "https://url.com", "description": "Brief description of this resource"}
  ]
}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert career and learning advisor. Always respond with valid JSON only, no markdown formatting.' 
          },
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.error('Rate limit exceeded');
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        console.error('Payment required');
        return new Response(JSON.stringify({ error: 'AI credits exhausted. Please add credits.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log('AI response received');

    const generatedText = data.choices?.[0]?.message?.content;
    
    if (!generatedText) {
      throw new Error('No content generated from AI');
    }

    // Parse the JSON from the response
    let roadmap;
    try {
      // Clean the response - remove markdown code blocks if present
      let cleanedText = generatedText.trim();
      if (cleanedText.startsWith('```json')) {
        cleanedText = cleanedText.slice(7);
      }
      if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.slice(3);
      }
      if (cleanedText.endsWith('```')) {
        cleanedText = cleanedText.slice(0, -3);
      }
      roadmap = JSON.parse(cleanedText.trim());
    } catch (parseError) {
      console.error('Failed to parse roadmap JSON:', parseError);
      console.log('Raw text:', generatedText);
      throw new Error('Failed to parse roadmap response');
    }

    return new Response(JSON.stringify({ roadmap }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Error in generate-roadmap function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
