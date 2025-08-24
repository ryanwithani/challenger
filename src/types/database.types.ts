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
      users: {
        Row: {
          id: string
          email: string
          username: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          username?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          username?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      challenges: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          challenge_type: string | null
          configuration: Json | null
          status: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          challenge_type?: string | null
          configuration?: Json | null
          status?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          challenge_type?: string | null
          configuration?: Json | null
          status?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      sims: {
        Row: {
          id: string
          challenge_id: string
          name: string
          traits: Json
          aspiration: string | null
          career: string | null
          age_stage: string | null
          generation: number
          is_heir: boolean
          relationship_to_heir: string | null
          created_at: string
          avatar_url: string | null
        }
        Insert: {
          id?: string
          challenge_id: string
          name: string
          traits?: Json
          aspiration?: string | null
          career?: string | null
          age_stage?: string | null
          generation?: number
          is_heir?: boolean
          relationship_to_heir?: string | null
          created_at?: string
          avatar_url?: string | null
        }
        Update: {
          id?: string
          challenge_id?: string
          name?: string
          traits?: Json
          aspiration?: string | null
          career?: string | null
          age_stage?: string | null
          generation?: number
          is_heir?: boolean
          relationship_to_heir?: string | null
          created_at?: string
          avatar_url?: string | null
        }
      }
      goals: {
        Row: {
          id: string
          challenge_id: string
          title: string
          description: string | null
          category: string | null
          point_value: number
          is_required: boolean
          order_index: number
          created_at: string
          goal_type: string
          current_value: number
          thresholds: string
          max_points: number
          target_value: number
        }
        Insert: {
          id?: string
          challenge_id: string
          title: string
          description?: string | null
          category?: string | null
          point_value?: number
          is_required?: boolean
          order_index?: number
          created_at?: string
          goal_type: string
          current_value: number
          thresholds: string
          max_points: number
          target_value: number
        }
        Update: {
          id?: string
          challenge_id?: string
          title?: string
          description?: string | null
          category?: string | null
          point_value?: number
          is_required?: boolean
          order_index?: number
          created_at?: string
          goal_type: string
          current_value: number
          thresholds: string
          max_points: number
          target_value: number
        }
      }
      progress: {
        Row: {
          id: string
          user_id: string
          goal_id: string
          sim_id: string | null
          completed_at: string
          notes: string | null
          completion_details: string
        }
        Insert: {
          id?: string
          user_id: string
          goal_id: string
          sim_id?: string | null
          completed_at?: string
          notes?: string | null
          completion_details: string
        }
        Update: {
          id?: string
          user_id?: string
          goal_id?: string
          sim_id?: string | null
          completed_at?: string
          notes?: string | null
          completion_details: string
        }
      }
      sim_achievements: {
        Row: {
          id: string
          goal_id: string
          sim_id: string | null
          goal_title: string
          completion_method: string
          points_earned: number
          achieved_at: string
          notes: string | null
        }
        Insert: {
          id?: string
          goal_id: string
          sim_id: string | null
          goal_title?: string
          completion_method?: string
          points_earned?: number
          achieved_at?: string
          notes?: string | null
        }
        Update: {
          id?: string
          goal_id: string
          sim_id: string | null
          goal_title?: string
          completion_method?: string
          points_earned?: number
          achieved_at?: string
          notes?: string | null
        }
      }
    }
  }
}