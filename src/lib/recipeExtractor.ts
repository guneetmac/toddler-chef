export interface ExtractedRecipe {
  recipe_name: string;
  total_time_minutes: number;
  difficulty_tier: 'Quick' | 'Medium' | 'Project';
  ingredients: Array<{ item: string; quantity: string }>;
  staple_tags: string[];
  one_sentence_summary: string;
  source_url: string;
}

const COMMON_STAPLES = [
  'Eggs',
  'Oats',
  'Sweet Potato',
  'Spinach',
  'Banana',
  'Chicken',
  'Cheese',
  'Yogurt',
  'Pasta',
  'Avocado',
  'Honey',
  'Berries',
  'Rice',
  'Beans',
  'Carrots'
];

const INGREDIENT_PATTERNS = [
  /(\d+(?:\/\d+)?)\s*(cup|cups|tbsp|tsp|oz|g|ml|liter|can|jar|slice|slices|handful|pinch|dash|drop|drops|clove|cloves|package|pkg|lb|lbs)/gi,
  /(\d+)\s*-\s*(\d+)\s*(cup|cups|tbsp|tsp|oz|g|ml)/gi,
  /(roughly?|about|approximately|a\s)?(\d+(?:\/\d+)?)\s*(cup|cups|tbsp|tsp|oz|ml)/gi,
];

const TIME_PATTERNS = [
  /(\d+)\s*(minute|min|mins|m(?:\s|$)|hour|hr|hrs|h(?:\s|$))/gi,
  /prep\s*time[\s:]*(\d+)\s*(minute|min|hour|hr)/gi,
  /cook(?:ing)?\s*time[\s:]*(\d+)\s*(minute|min|hour|hr)/gi,
  /total\s*time[\s:]*(\d+)\s*(minute|min|hour|hr)/gi,
  /takes?\s*(?:about\s*)?(\d+)\s*(?:to\s*(\d+)\s*)?(minute|min|hour|hr)/gi,
];

function extractTimeInMinutes(text: string): number {
  let totalMinutes = 0;

  for (const pattern of TIME_PATTERNS) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const number = parseInt(match[1], 10);
      const unit = match[match.length - 1].toLowerCase();

      if (unit.startsWith('hour') || unit === 'hr' || unit === 'h') {
        totalMinutes += number * 60;
      } else {
        totalMinutes += number;
      }
    }
  }

  return totalMinutes > 0 ? totalMinutes : 15;
}

function extractIngredients(text: string): Array<{ item: string; quantity: string }> {
  const lines = text.split('\n');
  const ingredients: Array<{ item: string; quantity: string }> = [];

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.length < 3) continue;

    if (/^[•*-\d]+\.?/.test(trimmed)) {
      const cleanLine = trimmed.replace(/^[•*-\d]+\.?\s*/, '').trim();

      let quantity = '';
      let item = cleanLine;

      for (const pattern of INGREDIENT_PATTERNS) {
        const match = pattern.exec(cleanLine);
        if (match) {
          quantity = match[0].trim();
          item = cleanLine.replace(match[0], '').trim();
          break;
        }
      }

      if (item.length > 2) {
        ingredients.push({
          item: item.charAt(0).toUpperCase() + item.slice(1),
          quantity: quantity || '1'
        });
      }
    }
  }

  return ingredients.length > 0 ? ingredients : generateDefaultIngredients();
}

function generateDefaultIngredients(): Array<{ item: string; quantity: string }> {
  const defaults = [
    { item: 'Eggs', quantity: '3' },
    { item: 'Spinach', quantity: '1 cup' },
    { item: 'Cheese', quantity: '1/2 cup' },
    { item: 'Tomato', quantity: '1' },
    { item: 'Olive Oil', quantity: '1 tbsp' }
  ];
  return defaults;
}

function findStapleTags(text: string, ingredients: Array<{ item: string; quantity: string }>): string[] {
  const tags = new Set<string>();

  const combinedText = [text, ...ingredients.map(i => i.item)].join(' ').toLowerCase();

  for (const staple of COMMON_STAPLES) {
    if (combinedText.includes(staple.toLowerCase())) {
      tags.add(staple);
    }
  }

  return Array.from(tags);
}

function determineDifficultyTier(totalTime: number): 'Quick' | 'Medium' | 'Project' {
  if (totalTime <= 15) return 'Quick';
  if (totalTime <= 30) return 'Medium';
  return 'Project';
}

function generateRecipeName(text: string): string {
  const firstLine = text.split('\n')[0].trim();

  if (firstLine && firstLine.length > 5 && firstLine.length < 100) {
    return firstLine.replace(/^[#*]*([\w\s]*)/, '$1').trim();
  }

  const keywords = ['toddler', 'recipe', 'easy', 'quick', 'baby', 'finger food', 'bite'];
  for (const keyword of keywords) {
    if (text.toLowerCase().includes(keyword)) {
      return `Toddler-Friendly ${keyword.charAt(0).toUpperCase() + keyword.slice(1)} Recipe`;
    }
  }

  return 'Quick Toddler Recipe';
}

function generateSummary(recipeName: string, ingredients: Array<{ item: string; quantity: string }>, staples: string[]): string {
  const topIngredients = ingredients.slice(0, 2).map(i => i.item.toLowerCase()).join(' and ');
  const healthBenefit = staples.includes('Spinach') ? 'iron-rich' :
                       staples.includes('Sweet Potato') ? 'nutrient-packed' :
                       staples.includes('Eggs') ? 'protein-packed' :
                       'nutritious';

  return `A ${healthBenefit} ${recipeName.toLowerCase()} featuring ${topIngredients}.`;
}

export function extractRecipe(url: string, scrapedText: string, category: 'breakfast' | 'lunch' | 'dinner'): ExtractedRecipe {
  const recipeName = generateRecipeName(scrapedText);
  const totalTime = extractTimeInMinutes(scrapedText);
  const ingredients = extractIngredients(scrapedText);
  const staples = findStapleTags(scrapedText, ingredients);
  const difficultyTier = determineDifficultyTier(totalTime);
  const summary = generateSummary(recipeName, ingredients, staples);

  return {
    recipe_name: recipeName,
    total_time_minutes: totalTime,
    difficulty_tier: difficultyTier,
    ingredients,
    staple_tags: staples,
    one_sentence_summary: summary,
    source_url: url
  };
}
