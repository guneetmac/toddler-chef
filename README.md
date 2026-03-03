# ToddlerChef 🍳 [https://toddlerchef.netlify.app/]

Your lifeline for feeding little ones without the stress. Built for busy moms juggling a million things, ToddlerChef helps you save, organize, and quickly find toddler-friendly recipes from Instagram, TikTok or any other website. No more scrolling through endless saved posts or wondering what to make for lunch - just quick, easy meal ideas when you need them most.

![PantryPulse](https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=1200)

## ✨ Features

### 🔗 Intelligent Recipe Import
- **Multi-Platform Support**: Import recipes from ANY website including:
  - Instagram and TikTok posts
  - AllRecipes, Food Network, Tasty
  - NYT Cooking, Bon Appetit, Epicurious
  - Simply Recipes, and thousands more
- **AI-Powered Extraction**: Automatically parses recipe text to extract:
  - Titles and descriptions
  - Ingredient lists with quantities
  - Cooking times
  - Difficulty levels
  - Step-by-step instructions
- **Smart Scraping**: Uses Recipe Schema (JSON-LD) markup to extract structured data from recipe websites
- **Flexible Input**: Manual paste option for quick recipe entry when auto-scraping isn't available

### 📚 Smart Organization
- **Category System**: Organize by Breakfast, Lunch, Dinner, and Snacks
- **Advanced Filtering**:
  - Time-based (Quick: <20min, Medium: 20-40min, Long: 40min+)
  - Difficulty levels (Easy, Medium, Hard)
  - Category filtering
  - Search functionality
- **Ingredient Tagging**: Automatic tagging for quick discovery

### 🎲 Panic Mode™
- **"I'm Hungry" Button**: Random recipe suggestions when decision fatigue hits
- **Category Quick Picks**: One-click breakfast, lunch, or dinner suggestions
- **Perfect for Busy Days**: Eliminate meal planning paralysis

### 🎨 Beautiful Interface
- Clean, modern design with warm, inviting colors
- Fully responsive (mobile & desktop)
- Fast, smooth interactions
- Visual recipe cards with all essential info

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- A Supabase account (free tier works great)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/pantrypulse.git
   cd pantrypulse
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Copy your project URL and anon key
   - Create a `.env` file in the root directory:
     ```env
     VITE_SUPABASE_URL=your_supabase_project_url
     VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

4. **Run database migrations**
   - In your Supabase dashboard, go to the SQL Editor
   - Run the migration files in order from `supabase/migrations/`
   - Or use the Supabase CLI:
     ```bash
     supabase db push
     ```

5. **Deploy the Edge Function**
   - For automatic recipe scraping from any website, deploy the edge function:
   - In Supabase dashboard: Database → Functions → Deploy new function
   - Upload the contents of `supabase/functions/scrape-instagram/`
   - Note: This function works with Instagram, TikTok, and any recipe website using standard Recipe Schema markup

6. **Start the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   - Navigate to `http://localhost:5173`

## 📖 Usage

### Adding a Recipe

#### Auto-Scrape Method (Recommended)
1. Click "Try Auto-Scrape" if you're in manual mode
2. Paste any recipe URL from:
   - Social media: Instagram, TikTok
   - Recipe sites: AllRecipes, Food Network, Tasty, NYT Cooking, etc.
3. Select a category (Breakfast, Lunch, Dinner, or Snacks)
4. Click "Save Recipe" - the system automatically extracts all details
5. Recipe is instantly saved to your collection

#### Manual Paste Method
1. Click "Paste Text" to switch to manual mode
2. Copy recipe text from any source (caption, blog post, etc.)
3. Paste the text into the large text area
4. Optionally add the source URL
5. Select a category and click "Save Recipe"

### Finding Recipes
- Use the search bar to find recipes by name or ingredient
- Apply filters for time, difficulty, or category
- Browse through your organized recipe collection

### Panic Mode
- Click "I'm Hungry" for a random recipe suggestion
- Or use the category quick picks (Breakfast, Lunch, Dinner)

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Backend**: Supabase (PostgreSQL)
- **Edge Functions**: Deno runtime
- **Deployment**: Vercel/Netlify compatible

## 📁 Project Structure

```
pantrypulse/
├── src/
│   ├── components/
│   │   ├── Dashboard.tsx       # Main recipe dashboard
│   │   ├── Filters.tsx         # Filter controls
│   │   ├── LinkParser.tsx      # Recipe import UI
│   │   ├── PanicButtons.tsx    # Random recipe picker
│   │   ├── PantryPulse.tsx     # Main app component
│   │   └── RecipeCard.tsx      # Recipe display card
│   ├── lib/
│   │   ├── supabase.ts         # Supabase client
│   │   ├── recipeExtractor.ts  # AI recipe parser
│   │   └── database.types.ts   # TypeScript types
│   ├── types/
│   │   └── recipe.ts           # Recipe interfaces
│   ├── App.tsx
│   └── main.tsx
├── supabase/
│   ├── migrations/             # Database migrations
│   └── functions/              # Edge functions
├── public/
└── package.json
```

## 🗄️ Database Schema

### Recipes Table
```sql
recipes (
  id uuid PRIMARY KEY,
  title text NOT NULL,
  url text NOT NULL,
  prep_time integer NOT NULL,
  ingredients text[] NOT NULL,
  category text NOT NULL,
  difficulty text,
  description text,
  instructions text[],
  tags text[],
  image_url text,
  created_at timestamptz
)
```

## 🔒 Security

- Row Level Security (RLS) enabled on all tables
- Public read/write access for MVP (authentication can be added)
- Edge functions for secure API calls
- Environment variables for sensitive data

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🐛 Known Issues

- Social media scraping (Instagram, TikTok) may require periodic updates due to platform changes
- Some recipe posts may not parse correctly if formatting is unusual
- Recipe Schema support varies by website - popular recipe sites work best

## 🚀 Future Enhancements

- [ ] User authentication and personal recipe collections
- [ ] Meal planning calendar
- [ ] Grocery list generation from recipes
- [ ] Recipe sharing and social features
- [ ] Nutritional information extraction
- [ ] Recipe ratings and reviews
- [ ] Export recipes to PDF
- [ ] Mobile app (React Native)

## 📧 Contact

Have questions or suggestions? Open an issue or reach out!

---

Made with ❤️ for mom cooks everywhere
