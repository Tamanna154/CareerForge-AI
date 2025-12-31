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
    const { messages, config } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an AI Interviewer conducting a professional ${config.interviewType} interview for the ${config.role} position.

Candidate Information:
- Name: ${config.name}
- Branch/Degree: ${config.branch}
- Experience Level: ${config.experienceLevel}
- Field of Interest: ${config.interestField}
- Interview Level: ${config.interviewLevel}
${config.resume ? `- Resume Summary: ${config.resume.substring(0, 1000)}` : ''}

INTERVIEW GUIDELINES:
1. Behave like a real professional interviewer
2. Ask ONE question at a time and wait for response
3. Base follow-up questions on candidate's answers and resume
4. For Technical interviews: Ask role-specific technical questions, problem-solving scenarios
5. For HR interviews: Ask behavioral questions, strengths/weaknesses, career goals
6. For Coding interviews: Present logical problems and evaluate approach
7. Maintain professional tone - no emojis, no casual language
8. Evaluate: clarity, confidence, technical understanding, communication
9. After 5-6 questions, wrap up with "Thank you for your time. The interview is now complete."
10. Keep responses concise and focused (2-3 sentences max per response)

Start by greeting the candidate and asking them to introduce themselves.`;

    console.log("Starting interview chat for:", config.name, config.interviewType);

    // Build OpenAI-compatible messages for Lovable AI Gateway
    const apiMessages = [
      { role: "system", content: systemPrompt }
    ];
    
    if (messages.length === 0) {
      apiMessages.push({ role: "user", content: "Please start the interview now." });
    } else {
      for (const msg of messages) {
        apiMessages.push({
          role: msg.role,
          content: msg.content
        });
      }
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: apiMessages,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Lovable AI error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      return new Response(JSON.stringify({ error: "AI API error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    console.log("AI response received");
    
    const aiText = data.choices?.[0]?.message?.content || "I apologize, I couldn't generate a response. Please try again.";

    return new Response(JSON.stringify({ response: aiText }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
    
  } catch (error) {
    console.error("Interview chat error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
