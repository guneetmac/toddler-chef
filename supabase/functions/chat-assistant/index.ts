import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatRequest {
  messages: Message[];
  recipes: string[];
  staples: string[];
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { messages, recipes, staples }: ChatRequest = await req.json();

    const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!anthropicKey) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing ANTHROPIC_API_KEY" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const recipeContext = recipes.length > 0
      ? `\nUser's existing recipes (up to 30 most recent):\n${recipes.join("\n")}`
      : "\nUser has no existing recipes yet.";

    const stapleContext = staples.length > 0
      ? `\nCurrent pantry staples selected: ${staples.join(", ")}`
      : "\nNo pantry staples currently selected.";

    const systemPrompt = `You are a friendly toddler nutrition expert and home chef assistant for the Toddler Chef app.

Your role:
- Answer toddler nutrition and recipe questions
- Suggest recipes from the user's existing collection when relevant
- Generate new toddler-friendly recipes when asked
- Keep all advice age-appropriate and safe for toddlers

Safety guidelines:
- No honey for children under 1 year old
- Soft textures only — avoid hard foods that are choking hazards
- Avoid added salt and sugar where possible
- Keep portions toddler-sized
- Flag common allergens (nuts, dairy, eggs, gluten) clearly
${recipeContext}
${stapleContext}

When generating a NEW recipe, use this EXACT format so it can be saved:
RECIPE: [Title]
TIME: [X] minutes
INGREDIENTS:
- [ingredient with quantity]
- [ingredient with quantity]
INSTRUCTIONS:
1. [step]
2. [step]
SUMMARY: [one sentence description]

Keep responses concise and parent-friendly. Be encouraging and practical.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": anthropicKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1024,
        system: systemPrompt,
        messages,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Claude API error: ${errorText}`);
    }

    const data = await response.json();
    const message = data.content[0]?.text ?? "";

    return new Response(
      JSON.stringify({ success: true, message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
