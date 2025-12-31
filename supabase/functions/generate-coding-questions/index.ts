import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { role, level, field } = await req.json();
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    console.log("Generating coding questions for:", { role, level, field });

    const systemPrompt = `You are a technical interviewer creating coding problems. Generate exactly 3 coding questions in JSON format.

The questions should be appropriate for a ${level} level ${role} position with interest in ${field}.

Difficulty distribution based on level:
- beginner: 2 Easy, 1 Medium
- intermediate: 1 Easy, 2 Medium  
- advanced: 1 Medium, 2 Hard

Return ONLY valid JSON in this exact format (no markdown, no explanation):
{
  "questions": [
    {
      "id": 1,
      "title": "Problem Title",
      "difficulty": "Easy|Medium|Hard",
      "description": "Full problem description with clear requirements",
      "examples": [
        {"input": "example input", "output": "expected output", "explanation": "optional explanation"}
      ],
      "constraints": ["constraint 1", "constraint 2"],
      "starterCode": "function solutionName(params) {\\n  // Write your code here\\n  \\n}",
      "hints": ["hint 1", "hint 2"]
    }
  ]
}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: `${systemPrompt}\n\nGenerate 3 coding problems for ${level} level ${role} interview. Field of interest: ${field}. Return only JSON.` }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 4096,
          }
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", response.status, errorText);
      throw new Error("Failed to generate questions");
    }

    const data = await response.json();
    let content = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    console.log("Raw Gemini response:", content);

    // Try to parse JSON from response
    try {
      // Remove markdown code blocks if present
      content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      const parsed = JSON.parse(content);
      
      if (parsed.questions && Array.isArray(parsed.questions)) {
        return new Response(JSON.stringify(parsed), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
    }

    // Return default questions if AI fails
    return new Response(JSON.stringify({ questions: [] }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error generating questions:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error", questions: [] }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
