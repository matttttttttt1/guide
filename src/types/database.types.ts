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
      profiles: {
        Row: {
          id: string
          email: string
          company_name: string | null
          business_number: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          company_name?: string | null
          business_number?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          company_name?: string | null
          business_number?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      guides: {
        Row: {
          id: string
          user_id: string
          name_ko: string | null
          name_en_first: string | null
          name_en_last: string | null
          type: string | null
          gender: string | null
          profile_image_url: string | null
          birth_date: string | null
          email: string | null
          languages: string[] | null
          messenger_type: string | null
          messenger_id: string | null
          notes: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name_ko?: string | null
          name_en_first?: string | null
          name_en_last?: string | null
          type?: string | null
          gender?: string | null
          profile_image_url?: string | null
          birth_date?: string | null
          email?: string | null
          languages?: string[] | null
          messenger_type?: string | null
          messenger_id?: string | null
          notes?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name_ko?: string | null
          name_en_first?: string | null
          name_en_last?: string | null
          type?: string | null
          gender?: string | null
          profile_image_url?: string | null
          birth_date?: string | null
          email?: string | null
          languages?: string[] | null
          messenger_type?: string | null
          messenger_id?: string | null
          notes?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
