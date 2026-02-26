# PantryPulse 🍳

A smart recipe management system that transforms how home cooks discover, organize, and plan meals from social media recipes. Import recipes from Instagram and TikTok, organize them intelligently, and never lose track of your saved recipes again.

![PantryPulse](https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=1200)

## ✨ Features

### 🔗 Intelligent Recipe Import
- **Social Media Integration**: Import recipes directly from Instagram and TikTok posts
- **AI-Powered Extraction**: Automatically parses recipe text to extract:
  - Titles and descriptions
  - Ingredient lists with quantities
  - Cooking times
  - Difficulty levels
  - Step-by-step instructions
- **Flexible Input**: Manual paste option for quick recipe entry

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

5. **Deploy the Edge Function (Optional)**
   - For Instagram scraping functionality, deploy the edge function:
   - In Supabase dashboard: Database → Functions → Deploy new function
   - Upload the contents of `supabase/functions/scrape-instagram/`

6. **Start the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   - Navigate to `http://localhost:5173`

## 📖 Usage

### Adding a Recipe
1. Click the "Add from Link" tab
2. Paste an Instagram or TikTok recipe URL
3. Click "Extract Recipe" and wait for AI to parse the content
4. Review and edit if needed
5. Click "Add Recipe"

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

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Recipe data parsed using AI-powered extraction
- Icons by [Lucide](https://lucide.dev)
- Stock photos from [Pexels](https://pexels.com)
- Built with [Supabase](https://supabase.com)

## 🐛 Known Issues

- Instagram scraping may require periodic updates due to platform changes
- Some recipe posts may not parse correctly if formatting is unusual

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

Made with ❤️ for home cooks everywhere
