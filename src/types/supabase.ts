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
          measurements: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          measurements?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          measurements?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      commissions: {
        Row: {
          id: string
          user_id: string
          status: string
          garment_type: string
          measurements: Json
          budget: number
          timeline: string
          details: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          status?: string
          garment_type: string
          measurements: Json
          budget: number
          timeline: string
          details: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          status?: string
          garment_type?: string
          measurements?: Json
          budget?: number
          timeline?: string
          details?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 