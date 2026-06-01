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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      academic_levels: {
        Row: {
          created_at: string
          id: string
          name_en: string | null
          name_fr: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name_en?: string | null
          name_fr: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name_en?: string | null
          name_fr?: string
          updated_at?: string
        }
        Relationships: []
      }
      campuses: {
        Row: {
          created_at: string
          id: string
          name_en: string | null
          name_fr: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name_en?: string | null
          name_fr: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name_en?: string | null
          name_fr?: string
          updated_at?: string
        }
        Relationships: []
      }
      courses: {
        Row: {
          created_at: string
          id: string
          name_en: string | null
          name_fr: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name_en?: string | null
          name_fr: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name_en?: string | null
          name_fr?: string
          updated_at?: string
        }
        Relationships: []
      }
      friend_pairs: {
        Row: {
          created_at: string
          id: string
          receiver_user_id: string
          requestor_user_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          receiver_user_id: string
          requestor_user_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          receiver_user_id?: string
          requestor_user_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "friend_pairs_receiver_user_id_fkey"
            columns: ["receiver_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friend_pairs_requestor_user_id_fkey"
            columns: ["requestor_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      friend_requests: {
        Row: {
          created_at: string
          id: string
          receiver_user_id: string
          requestor_user_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          receiver_user_id: string
          requestor_user_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          receiver_user_id?: string
          requestor_user_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "friend_requests_receiver_user_id_fkey"
            columns: ["receiver_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friend_requests_requestor_user_id_fkey"
            columns: ["requestor_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      skills: {
        Row: {
          created_at: string
          id: string
          name_en: string | null
          name_fr: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name_en?: string | null
          name_fr: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name_en?: string | null
          name_fr?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          auth_id: string
          created_at: string
          id: string
          role: Database["public"]["Enums"]["user_roles_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          auth_id: string
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_roles_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          auth_id?: string
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_roles_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          academic_level_id: string | null
          auth_id: string
          created_at: string
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          academic_level_id?: string | null
          auth_id: string
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          academic_level_id?: string | null
          auth_id?: string
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_academic_level_id_fkey"
            columns: ["academic_level_id"]
            isOneToOne: false
            referencedRelation: "academic_levels"
            referencedColumns: ["id"]
          },
        ]
      }
      users_availabilities: {
        Row: {
          created_at: string
          end_timestamp: string
          id: string
          recurring_days: Database["public"]["Enums"]["week_day_type"][] | null
          start_timestamp: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          end_timestamp: string
          id?: string
          recurring_days?: Database["public"]["Enums"]["week_day_type"][] | null
          start_timestamp: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          end_timestamp?: string
          id?: string
          recurring_days?: Database["public"]["Enums"]["week_day_type"][] | null
          start_timestamp?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_availabilities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users_campuses: {
        Row: {
          campus_id: string
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          campus_id: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          campus_id?: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_campuses_campus_id_fkey"
            columns: ["campus_id"]
            isOneToOne: false
            referencedRelation: "campuses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "users_campuses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users_courses: {
        Row: {
          class_id: string
          created_at: string
          end_date: string | null
          id: string
          start_date: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          class_id: string
          created_at?: string
          end_date?: string | null
          id?: string
          start_date?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          class_id?: string
          created_at?: string
          end_date?: string | null
          id?: string
          start_date?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_courses_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "users_courses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users_skills: {
        Row: {
          created_at: string
          id: string
          skill_id: string
          updated_at: string
          user_id: string
          user_skill_description: string | null
          user_skill_level: number
        }
        Insert: {
          created_at?: string
          id?: string
          skill_id: string
          updated_at?: string
          user_id: string
          user_skill_description?: string | null
          user_skill_level: number
        }
        Update: {
          created_at?: string
          id?: string
          skill_id?: string
          updated_at?: string
          user_id?: string
          user_skill_description?: string | null
          user_skill_level?: number
        }
        Relationships: [
          {
            foreignKeyName: "users_skills_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "users_skills_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_user_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      user_roles_type: "USER" | "ADMIN"
      week_day_type:
        | "MONDAY"
        | "TUESDAY"
        | "WEDNESDAY"
        | "THURSDAY"
        | "FRIDAY"
        | "SATURDAY"
        | "SUNDAY"
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
      user_roles_type: ["USER", "ADMIN"],
      week_day_type: [
        "MONDAY",
        "TUESDAY",
        "WEDNESDAY",
        "THURSDAY",
        "FRIDAY",
        "SATURDAY",
        "SUNDAY",
      ],
    },
  },
} as const
