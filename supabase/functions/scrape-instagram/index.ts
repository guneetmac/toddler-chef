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
  error?: string;
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
      console.error(`Failed to fetch: ${response.status}`);
      throw new Error(`Failed to fetch: ${response.status}`);
    }

    const html = await response.text();
    console.log('HTML length:', html.length);

    let recipeText = "";

    const scriptMatch = html.match(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/);
    if (scriptMatch) {
      try {
        const jsonData = JSON.parse(scriptMatch[1]);
        console.log('Found JSON-LD data');
        if (jsonData.articleBody) {
          recipeText = jsonData.articleBody;
          console.log('Found articleBody:', recipeText.substring(0, 100));
        }
      } catch (e) {
        console.log('Failed to parse JSON-LD:', e);
      }
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
            .replace(/\\n/g, "\n")
            .replace(/\\"/g, '"')
            .replace(/\\u([0-9a-fA-F]{4})/g, (_, code) => String.fromCharCode(parseInt(code, 16)))
            .replace(/\\r/g, "")
            .replace(/\\\\/g, "\\");
          console.log('Found via pattern, length:', recipeText.length);
          break;
        }
      }
    }

    if (!recipeText) {
      const allTextMatches = html.matchAll(/"text":"((?:[^"\\]|\\.)*)"/g);
      const texts = Array.from(allTextMatches).map(m =>
        m[1]
          .replace(/\\n/g, "\n")
          .replace(/\\"/g, '"')
          .replace(/\\u([0-9a-fA-F]{4})/g, (_, code) => String.fromCharCode(parseInt(code, 16)))
      );

      console.log('Found text matches:', texts.length);
      const longestText = texts.reduce((longest, current) =>
        current.length > longest.length ? current : longest, ""
      );

      if (longestText.length > 50) {
        recipeText = longestText;
        console.log('Using longest text, length:', recipeText.length);
      }
    }

    const titleMatch = html.match(/<meta property="og:title" content="([^"]*)"/);
    if (titleMatch && titleMatch[1] && !recipeText) {
      recipeText = titleMatch[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&');
      console.log('Using og:title');
    }

    const descriptionMatch = html.match(/<meta property="og:description" content="([^"]*)"/);
    if (descriptionMatch && descriptionMatch[1]) {
      const desc = descriptionMatch[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&');
      if (desc.length > 50 && (!recipeText || recipeText.length < desc.length)) {
        recipeText = desc;
        console.log('Using og:description');
      }
    }

    console.log('Final recipe text length:', recipeText.length);

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

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`);
    }

    const html = await response.text();

    let recipeText = "";

    const titleMatch = html.match(/<meta name="description" content="(.*?)"/);
    if (titleMatch) {
      recipeText = titleMatch[1];
    }

    const scriptMatch = html.match(/<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__" type="application\/json">(.*?)<\/script>/);
    if (scriptMatch) {
      try {
        const data = JSON.parse(scriptMatch[1]);
        const videoData = data?.__DEFAULT_SCOPE__?.["webapp.video-detail"]?.itemInfo?.itemStruct;
        if (videoData?.desc) {
          recipeText = videoData.desc;
        }
      } catch {
      }
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

async function scrapeGenericRecipeSite(url: string): Promise<string> {
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
    let recipeData: any = {};

    const jsonLdMatches = html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g);
    for (const match of jsonLdMatches) {
      try {
        const jsonData = JSON.parse(match[1]);
        const recipeSchema = Array.isArray(jsonData)
          ? jsonData.find((item: any) => item["@type"] === "Recipe")
          : jsonData["@type"] === "Recipe" ? jsonData : null;

        if (recipeSchema) {
          recipeData = recipeSchema;
          break;
        }
      } catch {
        continue;
      }
    }

    let recipeText = "";

    if (recipeData.name) {
      recipeText += `${recipeData.name}\n\n`;
    }

    if (recipeData.description) {
      recipeText += `${recipeData.description}\n\n`;
    }

    if (recipeData.totalTime || recipeData.prepTime || recipeData.cookTime) {
      const time = recipeData.totalTime || recipeData.prepTime || recipeData.cookTime;
      recipeText += `Time: ${time}\n\n`;
    }

    if (recipeData.recipeIngredient && Array.isArray(recipeData.recipeIngredient)) {
      recipeText += `Ingredients:\n`;
      recipeData.recipeIngredient.forEach((ingredient: string) => {
        recipeText += `• ${ingredient}\n`;
      });
      recipeText += `\n`;
    }

    if (recipeData.recipeInstructions) {
      recipeText += `Instructions:\n`;
      if (Array.isArray(recipeData.recipeInstructions)) {
        recipeData.recipeInstructions.forEach((instruction: any, idx: number) => {
          const text = typeof instruction === 'string' ? instruction : instruction.text;
          if (text) {
            recipeText += `${idx + 1}. ${text}\n`;
          }
        });
      } else if (typeof recipeData.recipeInstructions === 'string') {
        recipeText += recipeData.recipeInstructions;
      }
    }

    if (!recipeText || recipeText.length < 50) {
      const titleMatch = html.match(/<meta property="og:title" content="([^"]*)"/);
      const descMatch = html.match(/<meta property="og:description" content="([^"]*)"/);

      if (titleMatch) {
        recipeText = titleMatch[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&') + "\n\n";
      }
      if (descMatch) {
        recipeText += descMatch[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&');
      }
    }

    if (!recipeText || recipeText.length < 50) {
      return `Recipe from ${new URL(url).hostname}\n\nIngredients:\n• Check the original page for details\n\nTime: 20 minutes`;
    }

    return recipeText;
  } catch (error) {
    console.error("Scraping error:", error);
    return `Recipe from website\n\nIngredients:\n• Check the original page for details\n\nTime: 20 minutes`;
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { url }: ScrapeRequest = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ success: false, error: "URL is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    let content: string;

    if (url.includes("instagram.com")) {
      content = await scrapeInstagramContent(url);
    } else if (url.includes("tiktok.com")) {
      content = await scrapeTikTokContent(url);
    } else {
      content = await scrapeGenericRecipeSite(url);
    }

    const response: ScrapeResponse = {
      success: true,
      content,
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
