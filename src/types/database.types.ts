export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      audit_log: {
        Row: {
          created_at: string
          event: string
          id: number
          ip: string | null
          meta: Json
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event: string
          id?: number
          ip?: string | null
          meta?: Json
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event?: string
          id?: number
          ip?: string | null
          meta?: Json
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      challenges: {
        Row: {
          challenge_type: string | null
          completion_percentage: number
          configuration: Json | null
          created_at: string | null
          description: string | null
          id: string
          is_public: boolean | null
          is_template: boolean | null
          name: string
          points: number
          status: string | null
          total_points: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          challenge_type?: string | null
          completion_percentage?: number
          configuration?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          is_template?: boolean | null
          name: string
          points?: number
          status?: string | null
          total_points?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          challenge_type?: string | null
          completion_percentage?: number
          configuration?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          is_template?: boolean | null
          name?: string
          points?: number
          status?: string | null
          total_points?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      failed_login_attempts: {
        Row: {
          attempted_at: string | null
          created_at: string | null
          email: string
          id: string
          ip_address: unknown
        }
        Insert: {
          attempted_at?: string | null
          created_at?: string | null
          email: string
          id?: string
          ip_address?: unknown
        }
        Update: {
          attempted_at?: string | null
          created_at?: string | null
          email?: string
          id?: string
          ip_address?: unknown
        }
        Relationships: []
      }
      goals: {
        Row: {
          category: string | null
          challenge_id: string
          created_at: string | null
          current_value: number | null
          description: string | null
          generation: number | null
          goal_type: string | null
          id: string
          is_completed: boolean | null
          max_points: number | null
          order_index: number | null
          point_value: number | null
          sort_order: number | null
          target_value: number | null
          thresholds: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          challenge_id: string
          created_at?: string | null
          current_value?: number | null
          description?: string | null
          generation?: number | null
          goal_type?: string | null
          id?: string
          is_completed?: boolean | null
          max_points?: number | null
          order_index?: number | null
          point_value?: number | null
          sort_order?: number | null
          target_value?: number | null
          thresholds?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          challenge_id?: string
          created_at?: string | null
          current_value?: number | null
          description?: string | null
          generation?: number | null
          goal_type?: string | null
          id?: string
          is_completed?: boolean | null
          max_points?: number | null
          order_index?: number | null
          point_value?: number | null
          sort_order?: number | null
          target_value?: number | null
          thresholds?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "goals_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      progress: {
        Row: {
          challenge_id: string
          completed_at: string | null
          completion_details: Json | null
          created_at: string
          goal_id: string
          id: string
          notes: string | null
          sim_id: string | null
          user_id: string
        }
        Insert: {
          challenge_id: string
          completed_at?: string | null
          completion_details?: Json | null
          created_at?: string
          goal_id: string
          id?: string
          notes?: string | null
          sim_id?: string | null
          user_id: string
        }
        Update: {
          challenge_id?: string
          completed_at?: string | null
          completion_details?: Json | null
          created_at?: string
          goal_id?: string
          id?: string
          notes?: string | null
          sim_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "progress_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "progress_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      sim_achievements: {
        Row: {
          achieved_at: string | null
          completion_method: string
          goal_title: string
          id: string
          notes: string | null
          points_earned: number | null
          sim_id: string
        }
        Insert: {
          achieved_at?: string | null
          completion_method: string
          goal_title: string
          id?: string
          notes?: string | null
          points_earned?: number | null
          sim_id: string
        }
        Update: {
          achieved_at?: string | null
          completion_method?: string
          goal_title?: string
          id?: string
          notes?: string | null
          points_earned?: number | null
          sim_id?: string
        }
        Relationships: []
      }
      sims: {
        Row: {
          age_stage: string | null
          aspiration: string | null
          avatar_url: string | null
          career: string | null
          challenge_id: string | null
          created_at: string | null
          generation: number | null
          id: string
          is_heir: boolean | null
          name: string
          relationship_to_heir: string | null
          traits: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          age_stage?: string | null
          aspiration?: string | null
          avatar_url?: string | null
          career?: string | null
          challenge_id?: string | null
          created_at?: string | null
          generation?: number | null
          id?: string
          is_heir?: boolean | null
          name: string
          relationship_to_heir?: string | null
          traits?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          age_stage?: string | null
          aspiration?: string | null
          avatar_url?: string | null
          career?: string | null
          challenge_id?: string | null
          created_at?: string | null
          generation?: number | null
          id?: string
          is_heir?: boolean | null
          name?: string
          relationship_to_heir?: string | null
          traits?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sims_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sims_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          created_at: string
          expansion_packs: Json
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expansion_packs?: Json
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expansion_packs?: Json
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          display_name: string | null
          email: string
          id: string
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          email: string
          id: string
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          email?: string
          id?: string
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_manage_challenge: { Args: { ch_id: string }; Returns: boolean }
      is_account_locked:
        | { Args: never; Returns: boolean }
        | { Args: { user_email: string }; Returns: boolean }
      log_audit: {
        Args: { p_event: string; p_ip: string; p_meta: Json; p_ua: string }
        Returns: undefined
      }
    }
    Enums: {
      relationship_to_heir:
        | "spouse"
        | "child"
        | "parent"
        | "sibling"
        | "partner"
        | "roommate"
        | "other"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      relationship_to_heir: [
        "spouse",
        "child",
        "parent",
        "sibling",
        "partner",
        "roommate",
        "other",
      ],
    },
  },
} as const
