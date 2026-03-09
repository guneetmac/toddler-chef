import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: new URL('../instagramrecipes.env', import.meta.url).pathname });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const URLS = [
  'https://www.instagram.com/p/DAs_tuNItyv/',
  'https://www.instagram.com/p/DG3yf5co4n3/',
  'https://www.instagram.com/p/DBQuBjOIXKZ/',
  'https://www.instagram.com/p/DCmsa1tsLh_/',
  'https://www.instagram.com/p/DEKKZ8wMDsX/',
  'https://www.instagram.com/p/DFHppFuONiZ/',
  'https://www.instagram.com/p/DG-y3ZhNXQF/',
  'https://www.instagram.com/p/DGdvHMduo0a/',
  'https://www.instagram.com/p/DG3i6YwvhQU/',
  'https://www.instagram.com/p/DGqUyTqTXXV/',
  'https://www.instagram.com/p/DARRd0-sqka/',
  'https://www.instagram.com/p/DBQ_LxpO-PH/',
  'https://www.instagram.com/p/DCPKgwHIicR/',
  'https://www.instagram.com/p/DESABDgPeBL/',
  'https://www.instagram.com/p/DEIMgQYC-8f/',
  'https://www.instagram.com/p/DDZt5ahiv9b/',
  'https://www.instagram.com/p/DDkJwEcubDu/',
  'https://www.instagram.com/p/DDQO2MZSKZ5/',
  'https://www.instagram.com/p/C-ypbdhMJzD/',
  'https://www.instagram.com/p/DBKmicdSjB7/',
  'https://www.instagram.com/p/DAWOagMy5mB/',
  'https://www.instagram.com/p/DCGnicwsWhQ/',
  'https://www.instagram.com/p/DAXsuXQPkxs/',
  'https://www.instagram.com/p/C-xZlkVOUGN/',
  'https://www.instagram.com/p/C-7s1mtOAGP/',
  'https://www.instagram.com/p/C8rweOwM_bW/',
  'https://www.instagram.com/p/C9cQHOvoq1_/',
  'https://www.instagram.com/p/C7L3LP6I9kw/',
  'https://www.instagram.com/p/C84l0ntxvte/',
  'https://www.instagram.com/p/C6_7Lr2u5Ub/',
];

// Default category — change to 'breakfast', 'lunch', 'dinner', or 'snacks'
const DEFAULT_CATEGORY = 'dinner';

async function scrape(url) {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/scrape-instagram`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url }),
  });

  if (!res.ok) throw new Error(`Scrape failed (${res.status}): ${await res.text()}`);
  const data = await res.json();
  if (!data.success || !data.content) throw new Error(data.error || 'No content returned');
  return data.content;
}

function extractRecipe(url, text, category) {
  // Time extraction
  const timeMatch = text.match(/(\d+)\s*(minute|min|mins|hour|hr)/i);
  let prepTime = 15;
  if (timeMatch) {
    const num = parseInt(timeMatch[1]);
    const unit = timeMatch[2].toLowerCase();
    prepTime = unit.startsWith('hour') || unit === 'hr' ? num * 60 : num;
  }

  const difficultyTier = prepTime <= 15 ? 'Quick' : prepTime <= 30 ? 'Medium' : 'Project';

  // Title: first non-empty line, cleaned
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  let title = 'Quick Toddler Recipe';
  for (const line of lines.slice(0, 3)) {
    const cleaned = line.replace(/^[#*🍳🥗🍽️👶🧒]+\s*/, '').replace(/[!]+$/, '').trim();
    if (cleaned.length >= 5 && cleaned.length <= 100) { title = cleaned; break; }
  }

  // Ingredients
  const ingredientLines = lines.filter(l => /^[•*\-\d]/.test(l));
  const ingredients = ingredientLines.length > 0
    ? ingredientLines.map(l => l.replace(/^[•*\-\d.]+\s*/, '').trim()).filter(Boolean)
    : ['See original post for ingredients'];

  const STAPLES = ['Eggs','Oats','Sweet Potato','Spinach','Banana','Chicken','Cheese','Yogurt','Pasta','Avocado','Honey','Berries','Rice','Beans','Carrots'];
  const combined = [text, ...ingredients].join(' ').toLowerCase();
  const stapleTags = STAPLES.filter(s => combined.includes(s.toLowerCase()));

  const summary = `A toddler-friendly ${title.toLowerCase()}.`;

  return {
    title,
    url,
    prep_time: prepTime,
    ingredients,
    ingredients_with_quantities: ingredients.map(i => ({ item: i, quantity: '' })),
    difficulty_tier: difficultyTier,
    one_sentence_summary: summary,
    staple_tags: stapleTags,
    steps: [],
    category,
    meal_type: null,
  };
}

async function run() {
  let success = 0;
  let failed = 0;

  for (let i = 0; i < URLS.length; i++) {
    const url = URLS[i];
    console.log(`[${i + 1}/${URLS.length}] ${url}`);

    try {
      const content = await scrape(url);
      const recipe = extractRecipe(url, content, DEFAULT_CATEGORY);

      const { error } = await supabase.from('recipes').insert([recipe]);
      if (error) throw error;

      console.log(`  ✓ "${recipe.title}"`);
      success++;
    } catch (err) {
      console.error(`  ✗ Failed: ${err.message}`);
      failed++;
    }

    // Small delay to avoid hammering the edge function
    if (i < URLS.length - 1) await new Promise(r => setTimeout(r, 1000));
  }

  console.log(`\nDone: ${success} imported, ${failed} failed`);
}

run();
