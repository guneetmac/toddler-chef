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
      throw new Error(`Failed to fetch: ${response.status}`);
    }

    const html = await response.text();

    let recipeText = "";

    const captionMatch = html.match(/"caption":"(.*?)"/);
    if (captionMatch) {
      recipeText = captionMatch[1]
        .replace(/\\n/g, "\n")
        .replace(/\\"/g, '"')
        .replace(/\\u([0-9a-fA-F]{4})/g, (_, code) => String.fromCharCode(parseInt(code, 16)));
    }

    const titleMatch = html.match(/<meta property="og:title" content="(.*?)"/);
    if (titleMatch && !recipeText) {
      recipeText = titleMatch[1];
    }

    const descriptionMatch = html.match(/<meta property="og:description" content="(.*?)"/);
    if (descriptionMatch) {
      recipeText += "\n\n" + descriptionMatch[1];
    }

    const jsonLdMatch = html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s);
    if (jsonLdMatch) {
      try {
        const jsonData = JSON.parse(jsonLdMatch[1]);
        if (jsonData.articleBody) {
          recipeText += "\n\n" + jsonData.articleBody;
        }
      } catch {
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
      return new Response(
        JSON.stringify({ success: false, error: "Unsupported URL" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
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
