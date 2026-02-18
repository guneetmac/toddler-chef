export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      recipes: {
        Row: {
          id: string
          title: string
          url: string
          prep_time: number
          ingredients: string[]
          category: 'breakfast' | 'lunch' | 'dinner'
          created_at: string
          difficulty_tier: 'Quick' | 'Medium' | 'Project'
          one_sentence_summary: string | null
          ingredients_with_quantities: Json
          staple_tags: string[]
        }
        Insert: {
          id?: string
          title: string
          url: string
          prep_time: number
          ingredients: string[]
          category: 'breakfast' | 'lunch' | 'dinner'
          created_at?: string
          difficulty_tier?: 'Quick' | 'Medium' | 'Project'
          one_sentence_summary?: string | null
          ingredients_with_quantities?: Json
          staple_tags?: string[]
        }
        Update: {
          id?: string
          title?: string
          url?: string
          prep_time?: number
          ingredients?: string[]
          category?: 'breakfast' | 'lunch' | 'dinner'
          created_at?: string
          difficulty_tier?: 'Quick' | 'Medium' | 'Project'
          one_sentence_summary?: string | null
          ingredients_with_quantities?: Json
          staple_tags?: string[]
        }
      }
    }
  }
}
