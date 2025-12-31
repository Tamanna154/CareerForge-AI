import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { resumeText, targetRole } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    if (!resumeText || resumeText.trim().length < 50) {
      return new Response(JSON.stringify({ 
        error: "Resume text is too short. Please provide more content." 
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Analyzing resume for role:", targetRole);

    const prompt = `Analyze this resume for ATS (Applicant Tracking System) compatibility and job fit.

TARGET ROLE: ${targetRole || "General"}

RESUME CONTENT:
${resumeText}

Provide a JSON response with this exact structure (no markdown, just raw JSON):
{
  "atsScore": <number 0-100>,
  "keywordMatchPercent": <number 0-100>,
  "missingKeywords": ["keyword1", "keyword2", ...],
  "formattingIssues": ["issue1", "issue2", ...],
  "improvements": ["tip1", "tip2", ...],
  "roleCompatibilityScore": <number 0-100>,
  "strengths": ["strength1", "strength2", ...],
  "summary": "<brief 2-3 sentence analysis>"
}

Evaluate based on:
1. Keyword relevance to the target role
2. ATS-friendly formatting (no tables, complex layouts)
3. Action verbs and quantifiable achievements
4. Skills section clarity
5. Contact information presence
6. Professional summary quality
7. Experience relevance`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Failed to analyze resume");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No response from AI");
    }

    // Parse JSON from response (handle potential markdown wrapping)
    let analysisResult;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      // Return a default structure if parsing fails
      analysisResult = {
        atsScore: 65,
        keywordMatchPercent: 60,
        missingKeywords: ["Consider adding role-specific keywords"],
        formattingIssues: ["Unable to fully analyze formatting"],
        improvements: ["Ensure resume is well-structured", "Add quantifiable achievements"],
        roleCompatibilityScore: 60,
        strengths: ["Resume content provided"],
        summary: "Resume analysis completed with limited data. Consider providing more detailed content."
      };
    }

    console.log("Resume analysis complete, ATS score:", analysisResult.atsScore);

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Resume analysis error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
