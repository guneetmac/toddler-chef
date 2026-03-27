
# Toddler Chef — PM Case Study

> **Quick Recipes for Busy Parents**
> Save, organize, and retrieve toddler meal ideas from Instagram, TikTok, and recipe websites — filtered by time, ingredients on hand, and nutritional needs.
>
> 🔗 [Live App](https://toddlerchef.netlify.app) · [GitHub Repo](https://github.com/guneetmac/toddler-chef)

---

## The Problem

When my daughter started solids, I discovered a problem I hadn't anticipated: I had hundreds of toddler recipes saved across Instagram and TikTok, but zero ability to actually use them in the moment that mattered — the 15-minute window before a hungry toddler melts down.

The existing save features on social platforms are black holes. No search, no filtering by time, no way to filter by ingredients on hand, no nutritional visibility. The recipes existed. The retrieval system didn't.

**The core job-to-be-done:**
> *"When I have 15 minutes and a hungry toddler, help me find a recipe I can actually make right now."*

---

## Who I Built This For

**Primary user:** Parents of toddlers aged 6 months–3 years, managing solid food introduction while balancing work and time constraints.

**Key characteristics:**
- Already saving recipes on social media but can't retrieve them when it counts
- Anxious about nutritional balance — protein, carbs, fats, varied flavor profiles
- Operating in short time windows with high emotional stakes
- Not looking to *discover* new recipes — looking to *use* the ones they already have

I deliberately did not target cooking enthusiasts or meal planners. This is a retrieval and filtering tool for overwhelmed parents — not a recipe discovery platform.

---

## What I Built and Why

### ✅ Included in MVP

**Multi-platform recipe import with AI extraction**

The primary unlock. Users paste any URL from Instagram, TikTok, AllRecipes, NYT Cooking, or any recipe website, and the app automatically parses it into structured data: ingredients, prep time, difficulty, and instructions. This was the hardest technical problem and the most critical feature — without it, the app is just another recipe box.

**Authentication (login wall)**

Auth was intentionally included in the MVP. Recipe data needs to persist across sessions and devices — a parent who spends time importing 50 recipes cannot afford to lose that data on a browser clear or device switch. Supabase row-level security also ensures each user's recipe collection stays private. The friction cost of a login wall was a conscious tradeoff against data durability and privacy.

**Pantry Pulse**

Tap ingredients you have on hand, surface matching recipes instantly. This directly addresses the "I have chicken and sweet potato — what can I make in 10 minutes?" use case.

**Nutritional and time filters**

High protein, under 10 minutes, under 20 minutes, allergen exclusions (dairy, gluten, nuts, eggs). Built for the specific anxiety parents have around nutritional balance during the solids journey.

---

### ❌ Deliberately Cut from MVP

| Feature | Reason Cut |
|---|---|
| Meal planning calendar | Solves a different job (planning ahead) vs. the core job (right-now retrieval). Premature before validating the core loop. |
| Social sharing & ratings | Community features require critical mass. No value at MVP stage. |
| Nutritional scoring | Complex to implement accurately. Risk of false precision building distrust with parents. |
| Direct Instagram API integration | Platform policy complexity and rate limiting create dependency risk. Solved at the URL scraping level instead — works across all platforms without the fragility. |
| Saved pantry staples | High-value feature but adds setup friction on first use. Deferred to v2 — users must re-tap common ingredients each session for now. |

---

## The Riskiest Assumption

The product assumes the primary bottleneck is **findability** of recipes parents have already saved.

If the real problem is earlier in the funnel — decision fatigue about *what toddlers will actually eat*, or the fact that most parents haven't saved enough recipes to need a filtering system — then the retrieval-first approach solves the wrong problem.

This is the core hypothesis I am actively testing with early users.

---

## Early User Feedback

*Currently gathering — shared with initial users in March 2026. This section will be updated as patterns emerge.*

Key questions being tested:
- Do parents have enough saved recipes to make the import feature valuable?
- Is the login wall causing meaningful drop-off before first value is experienced?
- Is Pantry Pulse intuitive without onboarding guidance?

---

## What I'd Build Next (and Why)

**1. Saved pantry staples** *(Highest priority)*
Let users set a permanent list of always-on-hand ingredients (olive oil, eggs, butter) so Pantry Pulse doesn't require re-tapping basics every session. Identified through my own usage friction — likely universal.

**2. Onboarding flow**
The login wall creates friction before users understand the value proposition. A 3-step onboarding that demonstrates the core loop before requiring signup could significantly improve activation rate.

**3. Harden cross-device persistence**
Auth is in place but recipe collections still have edge cases across device switches. Fixing this is a trust-building feature — parents cannot lose their saved library.

**4. Direct Instagram integration** *(Future — pending platform policy clarity)*
The highest-requested feature conceptually, but the highest technical and policy risk. Will revisit once core retention metrics are proven.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite |
| Styling | Tailwind CSS |
| Backend | Supabase (PostgreSQL) |
| Edge Functions | Deno runtime |
| Deployment | Netlify |

---

## Key Learnings

**Scope ruthlessly.**
The instinct is to build everything. The MVP shipped faster and cleaner because I kept asking: *does this serve the 15-minute window use case?* If not, it got cut.

**Technical constraints are product decisions.**
The Instagram scraping limitation wasn't just an engineering problem — it shaped the product's core interaction model (import-from-URL vs. native social integration). That framing is actually more flexible and durable long-term.

**Auth friction is real.**
Requiring login before users experience any value is a known conversion killer. I made the tradeoff consciously for data durability, but it's the first thing I'd A/B test with sufficient traffic.

**Build for yourself first, then validate outward.**
Starting with a problem I personally experienced gave me high conviction during the build. The risk is building something only I need — which is exactly why early user feedback is the current priority.

---

*Built by [Guneet Mac](https://www.linkedin.com/in/guneet-mac/) — Product Manager with experience in B2B logistics and supply chain.*
*📧 guneetmac@gmail.com*
