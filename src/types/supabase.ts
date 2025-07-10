// src/types/supabase.ts
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
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          website?: string | null
          location?: string | null
          phone?: string | null
          preferences?: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          website?: string | null
          location?: string | null
          phone?: string | null
          preferences?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          website?: string | null
          location?: string | null
          phone?: string | null
          preferences?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      profile_measurements: {
        Row: {
          id: string
          profile_id: string
          chest?: number | null
          waist?: number | null
          hips?: number | null
          length?: number | null
          inseam?: number | null
          shoulders?: number | null
          neck?: number | null
          sleeve_length?: number | null
          bicep?: number | null
          forearm?: number | null
          wrist?: number | null
          armhole_depth?: number | null
          back_width?: number | null
          front_chest_width?: number | null
          thigh?: number | null
          knee?: number | null
          calf?: number | null
          ankle?: number | null
          rise?: number | null
          outseam?: number | null
          height?: number | null
          weight?: number | null
          torso_length?: number | null
          shoulder_slope?: number | null
          posture?: string | null
          size_preference?: string | null
          fit_preference?: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          chest?: number | null
          waist?: number | null
          hips?: number | null
          length?: number | null
          inseam?: number | null
          shoulders?: number | null
          neck?: number | null
          sleeve_length?: number | null
          bicep?: number | null
          forearm?: number | null
          wrist?: number | null
          armhole_depth?: number | null
          back_width?: number | null
          front_chest_width?: number | null
          thigh?: number | null
          knee?: number | null
          calf?: number | null
          ankle?: number | null
          rise?: number | null
          outseam?: number | null
          height?: number | null
          weight?: number | null
          torso_length?: number | null
          shoulder_slope?: number | null
          posture?: string | null
          size_preference?: string | null
          fit_preference?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          chest?: number | null
          waist?: number | null
          hips?: number | null
          length?: number | null
          inseam?: number | null
          shoulders?: number | null
          neck?: number | null
          sleeve_length?: number | null
          bicep?: number | null
          forearm?: number | null
          wrist?: number | null
          armhole_depth?: number | null
          back_width?: number | null
          front_chest_width?: number | null
          thigh?: number | null
          knee?: number | null
          calf?: number | null
          ankle?: number | null
          rise?: number | null
          outseam?: number | null
          height?: number | null
          weight?: number | null
          torso_length?: number | null
          shoulder_slope?: number | null
          posture?: string | null
          size_preference?: string | null
          fit_preference?: string | null
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
          budget: string
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
          budget: string
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
          budget?: string
          timeline?: string
          details?: string
          created_at?: string
          updated_at?: string
        }
      }
      commission_measurements: {
        Row: {
          id: string
          commission_id: string
          chest?: number | null
          waist?: number | null
          hips?: number | null
          length?: number | null
          inseam?: number | null
          shoulders?: number | null
          neck?: number | null
          sleeve_length?: number | null
          bicep?: number | null
          forearm?: number | null
          wrist?: number | null
          armhole_depth?: number | null
          back_width?: number | null
          front_chest_width?: number | null
          thigh?: number | null
          knee?: number | null
          calf?: number | null
          ankle?: number | null
          rise?: number | null
          outseam?: number | null
          height?: number | null
          weight?: number | null
          torso_length?: number | null
          shoulder_slope?: number | null
          posture?: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          commission_id: string
          chest?: number | null
          waist?: number | null
          hips?: number | null
          length?: number | null
          inseam?: number | null
          shoulders?: number | null
          neck?: number | null
          sleeve_length?: number | null
          bicep?: number | null
          forearm?: number | null
          wrist?: number | null
          armhole_depth?: number | null
          back_width?: number | null
          front_chest_width?: number | null
          thigh?: number | null
          knee?: number | null
          calf?: number | null
          ankle?: number | null
          rise?: number | null
          outseam?: number | null
          height?: number | null
          weight?: number | null
          torso_length?: number | null
          shoulder_slope?: number | null
          posture?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          commission_id?: string
          chest?: number | null
          waist?: number | null
          hips?: number | null
          length?: number | null
          inseam?: number | null
          shoulders?: number | null
          neck?: number | null
          sleeve_length?: number | null
          bicep?: number | null
          forearm?: number | null
          wrist?: number | null
          armhole_depth?: number | null
          back_width?: number | null
          front_chest_width?: number | null
          thigh?: number | null
          knee?: number | null
          calf?: number | null
          ankle?: number | null
          rise?: number | null
          outseam?: number | null
          height?: number | null
          weight?: number | null
          torso_length?: number | null
          shoulder_slope?: number | null
          posture?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          commission_id: string
          sender_id: string
          content: string
          created_at: string
          read: boolean
        }
        Insert: {
          id?: string
          commission_id: string
          sender_id: string
          content: string
          created_at?: string
          read?: boolean
        }
        Update: {
          id?: string
          commission_id?: string
          sender_id?: string
          content?: string
          created_at?: string
          read?: boolean
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}

// Types for profile and measurements
export type ProfileWithMeasurements = Database['public']['Tables']['profiles']['Row'] & {
  measurements?: Database['public']['Tables']['profile_measurements']['Row']
}

// Types for commission and measurements
export type CommissionWithMeasurements = Database['public']['Tables']['commissions']['Row'] & {
  measurements?: Database['public']['Tables']['commission_measurements']['Row']
}