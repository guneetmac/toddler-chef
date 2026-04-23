import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ScrapeRequest {
  url: string;
}

interface ScrapeResponse {
  success: boolean;
  content?: string;
  structured?: StructuredRecipe | null;
  error?: string;
}

interface StructuredRecipe {
  name: string;
  description: string;
  totalTimeMinutes: number;
  ingredients: string[];
  steps: string[];
}

function parseDuration(iso: string): number {
  const hours = iso.match(/(\d+)H/);
  const mins = iso.match(/(\d+)M/);
  return (hours ? parseInt(hours[1]) * 60 : 0) + (mins ? parseInt(mins[1]) : 0);
}

function findRecipeSchema(jsonData: any): any {
  const isRecipe = (item: any) => {
    const t = item?.['@type'];
    return t === 'Recipe' || (Array.isArray(t) && t.includes('Recipe'));
  };
  if (isRecipe(jsonData)) return jsonData;
  if (Array.isArray(jsonData)) return jsonData.find(isRecipe) ?? null;
  if (jsonData?.['@graph']) return jsonData['@graph'].find(isRecipe) ?? null;
  return null;
}

/** Strip all HTML tags and decode entities to get readable plain text */
function htmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<\/h[1-6]>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** Extract a single attribute value from an HTML string */
function attr(html: string, attribute: string): string {
  const m = html.match(new RegExp(`${attribute}="([^"]*)"`, 'i'));
  return m ? m[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&').trim() : '';
}

/** Pull inner text out of an HTML fragment */
function innerText(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * WP Recipe Maker (WPRM) — used by feedingtinybellies, mjandhungryman, etc.
 * Ingredients are in <li class="wprm-recipe-ingredient"> with child spans.
 */
function extractWPRM(html: string): StructuredRecipe | null {
  if (!html.includes('wprm-recipe')) return null;

  const nameMatch = html.match(/<[^>]*class="[^"]*wprm-recipe-name[^"]*"[^>]*>([\s\S]*?)<\//);
  const name = nameMatch ? innerText(nameMatch[1]) : '';

  const minMatch = html.match(/<[^>]*class="[^"]*wprm-recipe-total_time-minutes[^"]*"[^>]*>(\d+)<\//);
  const hrMatch  = html.match(/<[^>]*class="[^"]*wprm-recipe-total_time-hours[^"]*"[^>]*>(\d+)<\//);
  const totalTimeMinutes = (hrMatch ? parseInt(hrMatch[1]) * 60 : 0) + (minMatch ? parseInt(minMatch[1]) : 0) || 20;

  const ingredients: string[] = [];
  const liPattern = /<li[^>]*class="[^"]*wprm-recipe-ingredient[^"]*"[^>]*>([\s\S]*?)<\/li>/g;
  let m: RegExpExecArray | null;
  while ((m = liPattern.exec(html)) !== null) {
    const liHTML = m[1];
    const amount = liHTML.match(/<[^>]*class="[^"]*wprm-recipe-ingredient-amount[^"]*"[^>]*>([\s\S]*?)<\//);
    const unit   = liHTML.match(/<[^>]*class="[^"]*wprm-recipe-ingredient-unit[^"]*"[^>]*>([\s\S]*?)<\//);
    const iname  = liHTML.match(/<[^>]*class="[^"]*wprm-recipe-ingredient-name[^"]*"[^>]*>([\s\S]*?)<\//);
    const notes  = liHTML.match(/<[^>]*class="[^"]*wprm-recipe-ingredient-notes[^"]*"[^>]*>([\s\S]*?)<\//);
    if (iname) {
      const parts = [
        amount ? innerText(amount[1]) : '',
        unit   ? innerText(unit[1])   : '',
        innerText(iname[1]),
        notes  ? `(${innerText(notes[1])})` : '',
      ].filter(Boolean);
      ingredients.push(parts.join(' '));
    }
  }

  const steps: string[] = [];
  const stepPattern = /<[^>]*class="[^"]*wprm-recipe-instruction-text[^"]*"[^>]*>([\s\S]*?)<\/(?:div|p)>/g;
  while ((m = stepPattern.exec(html)) !== null) {
    const text = innerText(m[1]);
    if (text.length > 10) steps.push(text);
  }

  const descMatch = html.match(/<[^>]*class="[^"]*wprm-recipe-summary[^"]*"[^>]*>([\s\S]*?)<\/(?:div|p)>/);
  const description = descMatch ? innerText(descMatch[1]) : '';

  if (ingredients.length === 0) return null;
  return { name: name || 'Recipe', description, totalTimeMinutes, ingredients, steps };
}

/**
 * Tasty Recipes plugin — used by many food blogs.
 */
function extractTastyRecipes(html: string): StructuredRecipe | null {
  if (!html.includes('tasty-recipes')) return null;

  const nameMatch = html.match(/<[^>]*class="[^"]*tasty-recipes-title[^"]*"[^>]*>([\s\S]*?)<\//);
  const name = nameMatch ? innerText(nameMatch[1]) : '';

  const ingredients: string[] = [];
  const liPattern = /<li[^>]*>([\s\S]*?)<\/li>/g;
  // Only look inside the ingredients container
  const containerMatch = html.match(/<[^>]*class="[^"]*tasty-recipes-ingredients[^"]*"[^>]*>([\s\S]*?)<\/(?:div|ul|ol)>/);
  if (containerMatch) {
    let m: RegExpExecArray | null;
    while ((m = liPattern.exec(containerMatch[1])) !== null) {
      const text = innerText(m[1]);
      if (text.length > 2) ingredients.push(text);
    }
  }

  const steps: string[] = [];
  const stepsContainer = html.match(/<[^>]*class="[^"]*tasty-recipes-instructions[^"]*"[^>]*>([\s\S]*?)<\/(?:div|ol)>/);
  if (stepsContainer) {
    let m: RegExpExecArray | null;
    while ((m = liPattern.exec(stepsContainer[1])) !== null) {
      const text = innerText(m[1]);
      if (text.length > 10) steps.push(text);
    }
  }

  if (ingredients.length === 0) return null;
  return { name: name || 'Recipe', description: '', totalTimeMinutes: 20, ingredients, steps };
}

/**
 * Build a structured recipe from JSON-LD recipeData.
 */
function structuredFromJsonLd(recipeData: any): StructuredRecipe {
  const rawTime = recipeData.totalTime ?? recipeData.cookTime ?? recipeData.prepTime;
  const totalTimeMinutes = rawTime ? parseDuration(String(rawTime)) || 15 : 15;

  const ingredients: string[] = Array.isArray(recipeData.recipeIngredient)
    ? recipeData.recipeIngredient.filter((i: any) => typeof i === 'string')
    : [];

  let steps: string[] = [];
  if (Array.isArray(recipeData.recipeInstructions)) {
    steps = recipeData.recipeInstructions
      .map((s: any) => typeof s === 'string' ? s : (s.text ?? ''))
      .filter((s: string) => s.length > 0);
  } else if (typeof recipeData.recipeInstructions === 'string') {
    steps = [recipeData.recipeInstructions];
  }

  return {
    name: recipeData.name ?? '',
    description: recipeData.description ?? '',
    totalTimeMinutes,
    ingredients,
    steps,
  };
}

/**
 * Build the plain-text `content` string from a StructuredRecipe
 * so the client has something readable even when it uses `structured` directly.
 */
function buildContent(s: StructuredRecipe): string {
  let text = `${s.name}\n\n`;
  if (s.description) text += `${s.description}\n\n`;
  text += `Time: ${s.totalTimeMinutes} minutes\n\n`;
  if (s.ingredients.length) {
    text += `Ingredients:\n${s.ingredients.map(i => `• ${i}`).join('\n')}\n\n`;
  }
  if (s.steps.length) {
    text += `Instructions:\n${s.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}`;
  }
  return text;
}

async function scrapeInstagramContent(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`);
    }

    const html = await response.text();
    let recipeText = "";

    const scriptMatch = html.match(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/);
    if (scriptMatch) {
      try {
        const jsonData = JSON.parse(scriptMatch[1]);
        if (jsonData.articleBody) {
          recipeText = jsonData.articleBody;
        }
      } catch (_e) { /* ignore */ }
    }

    if (!recipeText) {
      const patterns = [
        /"edge_media_to_caption":\{"edges":\[\{"node":\{"text":"((?:[^"\\]|\\[\s\S])*)"\}\}\]\}/,
        /"caption":\{"text":"((?:[^"\\]|\\[\s\S])*)"\}/,
        /"caption":"((?:[^"\\]|\\[\s\S])*)"/,
      ];
      for (const pattern of patterns) {
        const match = html.match(pattern);
        if (match && match[1] && match[1].length > 50) {
          recipeText = match[1]
            .replace(/\\n/g, "\n").replace(/\\"/g, '"')
            .replace(/\\u([0-9a-fA-F]{4})/g, (_, code) => String.fromCharCode(parseInt(code, 16)))
            .replace(/\\r/g, "").replace(/\\\\/g, "\\");
          break;
        }
      }
    }

    if (!recipeText) {
      const allTextMatches = html.matchAll(/"text":"((?:[^"\\]|\\.)*)"/g);
      const texts = Array.from(allTextMatches).map(m =>
        m[1].replace(/\\n/g, "\n").replace(/\\"/g, '"')
          .replace(/\\u([0-9a-fA-F]{4})/g, (_, code) => String.fromCharCode(parseInt(code, 16)))
      );
      const longestText = texts.reduce((a, b) => b.length > a.length ? b : a, "");
      if (longestText.length > 50) recipeText = longestText;
    }

    const titleMatch = html.match(/<meta property="og:title" content="([^"]*)"/);
    if (titleMatch && !recipeText) {
      recipeText = titleMatch[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&');
    }

    const descMatch = html.match(/<meta property="og:description" content="([^"]*)"/);
    if (descMatch && descMatch[1]) {
      const desc = descMatch[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&');
      if (desc.length > 50 && (!recipeText || recipeText.length < desc.length)) {
        recipeText = desc;
      }
    }

    if (!recipeText || recipeText.length < 20) {
      return `Recipe from Instagram\n\nIngredients:\n• Check the original post for details\n\nTime: 15 minutes`;
    }
    return recipeText;
  } catch (error) {
    console.error("Scraping error:", error);
    return `Recipe from Instagram\n\nIngredients:\n• Check the original post for details\n\nTime: 15 minutes`;
  }
}

async function scrapeTikTokContent(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      },
    });
    if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);

    const html = await response.text();
    let recipeText = "";

    const titleMatch = html.match(/<meta name="description" content="(.*?)"/);
    if (titleMatch) recipeText = titleMatch[1];

    const scriptMatch = html.match(/<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__" type="application\/json">(.*?)<\/script>/);
    if (scriptMatch) {
      try {
        const data = JSON.parse(scriptMatch[1]);
        const videoData = data?.__DEFAULT_SCOPE__?.["webapp.video-detail"]?.itemInfo?.itemStruct;
        if (videoData?.desc) recipeText = videoData.desc;
      } catch { /* ignore */ }
    }

    if (!recipeText || recipeText.length < 20) {
      return `Recipe from TikTok\n\nIngredients:\n• Check the original video for details\n\nTime: 15 minutes`;
    }
    return recipeText;
  } catch (error) {
    console.error("Scraping error:", error);
    return `Recipe from TikTok\n\nIngredients:\n• Check the original video for details\n\nTime: 15 minutes`;
  }
}

async function scrapeGenericRecipeSite(url: string): Promise<{ content: string; structured: StructuredRecipe | null }> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
    });

    if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);

    const html = await response.text();
    let structured: StructuredRecipe | null = null;

    // ── Strategy 1: JSON-LD ──────────────────────────────────────────────────
    const jsonLdMatches = html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g);
    for (const match of jsonLdMatches) {
      try {
        const jsonData = JSON.parse(match[1]);
        const found = findRecipeSchema(jsonData);
        if (found) {
          structured = structuredFromJsonLd(found);
          console.log('Extracted via JSON-LD, ingredients:', structured.ingredients.length);
          break;
        }
      } catch { continue; }
    }

    // ── Strategy 2: WP Recipe Maker HTML ────────────────────────────────────
    if (!structured) {
      structured = extractWPRM(html);
      if (structured) console.log('Extracted via WPRM HTML, ingredients:', structured.ingredients.length);
    }

    // ── Strategy 3: Tasty Recipes HTML ──────────────────────────────────────
    if (!structured) {
      structured = extractTastyRecipes(html);
      if (structured) console.log('Extracted via Tasty Recipes HTML, ingredients:', structured.ingredients.length);
    }

    // ── Build content text ───────────────────────────────────────────────────
    if (structured && structured.ingredients.length > 0) {
      return { content: buildContent(structured), structured };
    }

    // ── Strategy 4: strip HTML → plain text for client-side extractRecipe() ─
    const titleMatch = html.match(/<meta property="og:title" content="([^"]*)"/);
    const title = titleMatch ? titleMatch[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&') : '';

    // Extract the body section only (skip head, nav, footer, ads)
    const bodyMatch = html.match(/<(?:main|article|div[^>]*(?:content|recipe|post)[^>]*)[\s\S]*?>([\s\S]*?)<\/(?:main|article)>/i);
    const rawSection = bodyMatch ? bodyMatch[1] : html;
    const plainText = htmlToText(rawSection);

    const content = title
      ? `${title}\n\n${plainText.slice(0, 3000)}`
      : plainText.slice(0, 3000);

    if (content.length > 100) {
      console.log('Falling back to stripped HTML text, length:', content.length);
      return { content, structured: null };
    }

    // ── Last resort ──────────────────────────────────────────────────────────
    return {
      content: `Recipe from ${new URL(url).hostname}\n\nIngredients:\n• Check the original page for details\n\nTime: 20 minutes`,
      structured: null,
    };
  } catch (error) {
    console.error("Scraping error:", error);
    return {
      content: `Recipe from website\n\nIngredients:\n• Check the original page for details\n\nTime: 20 minutes`,
      structured: null,
    };
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { url }: ScrapeRequest = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ success: false, error: "URL is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let response: ScrapeResponse;

    if (url.includes("instagram.com")) {
      const content = await scrapeInstagramContent(url);
      response = { success: true, content, structured: null };
    } else if (url.includes("tiktok.com")) {
      const content = await scrapeTikTokContent(url);
      response = { success: true, content, structured: null };
    } else {
      const { content, structured } = await scrapeGenericRecipeSite(url);
      response = { success: true, content, structured };
    }

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
