# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server at localhost:5173
npm run build      # Production build
npm run lint       # ESLint
npm run typecheck  # TypeScript type checking (no emit)
npm run preview    # Preview production build
```

There are no tests in this project.

## Environment Variables

Requires a `.env` file with:
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

## Architecture

**Single-page React app** with no routing. `App.tsx` renders only `<Dashboard />`, which owns all state.

### State & Filtering

All filter state lives in `Dashboard.tsx` and is passed down as props. Filtering happens client-side in a single `filteredRecipes` array derived from the full recipes list fetched from Supabase on mount.

Filter dimensions:
- `selectedCategory` — breakfast / lunch / dinner / snacks / all
- `panicFilter` — under-10 / under-20 / high-protein (from `PanicButtons`)
- `selectedStaples` — ingredient list (from `Filters` → Pantry Filter dropdown)
- `vegetarianFilter`, `proteinTypeFilter`, `allergyFilters` — from `Filters`
- `mealTypeFilter`, `customMealTypes` — meal type sub-categorization (pasta, pancakes, etc.), extensible by user at runtime

### Recipe Import Flow

1. `LinkParser` calls the Supabase Edge Function (`scrape-instagram`) with a URL → gets back raw scraped text
2. `extractRecipe()` in `src/lib/recipeExtractor.ts` parses that text using regex patterns to extract: title, prep time, ingredients with quantities, staple tags, difficulty tier, steps, and a one-sentence summary
3. Result is inserted into Supabase `recipes` table

Manual paste mode skips the edge function and passes text directly to `extractRecipe()`.

### Database

Single `recipes` table in Supabase (PostgreSQL) with RLS enabled (public read/write, no auth for MVP). Schema evolved via migrations in `supabase/migrations/`. Key columns beyond the basics:
- `ingredients` (text[]) — flat list e.g. `"1 cup spinach"`
- `ingredients_with_quantities` (jsonb) — structured `{ item, quantity }` pairs
- `staple_tags` (text[]) — used for Pantry Pulse matching (eggs, chicken, yogurt, etc.)
- `difficulty_tier` — Quick (≤15 min) / Medium (≤30 min) / Project (>30 min)
- `meal_type` — optional sub-category with check constraint: pasta, pancakes, muffins, curries, paratha, or custom values added at runtime (note: DB constraint only covers the defaults)

### Styling

Tailwind CSS with two custom color scales defined in `tailwind.config.js`: `sage` (green) and `warmOrange`. Use these instead of standard Tailwind green/orange.

### Edge Function

`supabase/functions/scrape-instagram/` — Deno runtime, deployed to Supabase. Called via fetch from `LinkParser` with the Supabase anon key as Bearer token.

## Skills

Project-level skills are defined in `.claude/settings.json`. Invoke with `/skill-name`:

| Skill | Description |
|---|---|
| `/migration` | Create a new timestamped Supabase migration file |
| `/add-filter` | Add a new filter dimension to the recipe filtering system |
| `/add-meal-type` | Add a new default meal type (updates type, components, and DB constraint) |
