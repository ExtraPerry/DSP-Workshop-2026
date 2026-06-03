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
      badges: {
        Row: {
          created_at: string
          criteria_description: string | null
          description_en: string | null
          description_fr: string | null
          icon_url: string | null
          id: string
          name_en: string | null
          name_fr: string
          points_reward: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          criteria_description?: string | null
          description_en?: string | null
          description_fr?: string | null
          icon_url?: string | null
          id?: string
          name_en?: string | null
          name_fr: string
          points_reward?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          criteria_description?: string | null
          description_en?: string | null
          description_fr?: string | null
          icon_url?: string | null
          id?: string
          name_en?: string | null
          name_fr?: string
          points_reward?: number
          updated_at?: string
        }
        Relationships: []
      }
      campuses: {
        Row: {
          created_at: string
          created_by_user_id: string | null
          id: string
          is_verified: boolean
          name_en: string | null
          name_fr: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by_user_id?: string | null
          id?: string
          is_verified?: boolean
          name_en?: string | null
          name_fr: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by_user_id?: string | null
          id?: string
          is_verified?: boolean
          name_en?: string | null
          name_fr?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campuses_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      challenges: {
        Row: {
          badge_reward_id: string | null
          created_at: string
          description_en: string | null
          description_fr: string | null
          end_date: string | null
          goal_count: number
          goal_type: string
          id: string
          image_url: string | null
          name_en: string | null
          name_fr: string
          points_reward: number
          start_date: string | null
          updated_at: string
        }
        Insert: {
          badge_reward_id?: string | null
          created_at?: string
          description_en?: string | null
          description_fr?: string | null
          end_date?: string | null
          goal_count: number
          goal_type: string
          id?: string
          image_url?: string | null
          name_en?: string | null
          name_fr: string
          points_reward?: number
          start_date?: string | null
          updated_at?: string
        }
        Update: {
          badge_reward_id?: string | null
          created_at?: string
          description_en?: string | null
          description_fr?: string | null
          end_date?: string | null
          goal_count?: number
          goal_type?: string
          id?: string
          image_url?: string | null
          name_en?: string | null
          name_fr?: string
          points_reward?: number
          start_date?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenges_badge_reward_id_fkey"
            columns: ["badge_reward_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
        ]
      }
      content_reports: {
        Row: {
          created_at: string
          id: string
          reason: string
          reported_entity_id: string
          reported_entity_type: string
          reporter_user_id: string
          resolution_note: string | null
          resolved_by_user_id: string | null
          status: Database["public"]["Enums"]["report_status_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          reason: string
          reported_entity_id: string
          reported_entity_type: string
          reporter_user_id: string
          resolution_note?: string | null
          resolved_by_user_id?: string | null
          status?: Database["public"]["Enums"]["report_status_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          reason?: string
          reported_entity_id?: string
          reported_entity_type?: string
          reporter_user_id?: string
          resolution_note?: string | null
          resolved_by_user_id?: string | null
          status?: Database["public"]["Enums"]["report_status_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_reports_reporter_user_id_fkey"
            columns: ["reporter_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_reports_resolved_by_user_id_fkey"
            columns: ["resolved_by_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          created_at: string
          created_by_user_id: string | null
          id: string
          is_verified: boolean
          name_en: string | null
          name_fr: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by_user_id?: string | null
          id?: string
          is_verified?: boolean
          name_en?: string | null
          name_fr: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by_user_id?: string | null
          id?: string
          is_verified?: boolean
          name_en?: string | null
          name_fr?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "courses_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      direct_conversations: {
        Row: {
          created_at: string
          friend_pair_id: string
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          friend_pair_id: string
          id?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          friend_pair_id?: string
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "direct_conversations_friend_pair_id_fkey"
            columns: ["friend_pair_id"]
            isOneToOne: true
            referencedRelation: "friend_pairs"
            referencedColumns: ["id"]
          },
        ]
      }
      direct_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          sender_user_id: string
          updated_at: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          sender_user_id: string
          updated_at?: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          sender_user_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "direct_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "direct_conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "direct_messages_sender_user_id_fkey"
            columns: ["sender_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
      match_history: {
        Row: {
          created_at: string
          feedback: string | null
          id: string
          match_request_id: string
          outcome: Database["public"]["Enums"]["match_outcome_type"]
          rating: number | null
          requestor_user_id: string
          skill_id: string
          target_user_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          feedback?: string | null
          id?: string
          match_request_id: string
          outcome: Database["public"]["Enums"]["match_outcome_type"]
          rating?: number | null
          requestor_user_id: string
          skill_id: string
          target_user_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          feedback?: string | null
          id?: string
          match_request_id?: string
          outcome?: Database["public"]["Enums"]["match_outcome_type"]
          rating?: number | null
          requestor_user_id?: string
          skill_id?: string
          target_user_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "match_history_match_request_id_fkey"
            columns: ["match_request_id"]
            isOneToOne: false
            referencedRelation: "match_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_history_requestor_user_id_fkey"
            columns: ["requestor_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_history_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_history_target_user_id_fkey"
            columns: ["target_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      match_requests: {
        Row: {
          created_at: string
          id: string
          message: string | null
          requestor_user_id: string
          skill_id: string
          status: Database["public"]["Enums"]["match_request_status_type"]
          target_user_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          message?: string | null
          requestor_user_id: string
          skill_id: string
          status?: Database["public"]["Enums"]["match_request_status_type"]
          target_user_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string | null
          requestor_user_id?: string
          skill_id?: string
          status?: Database["public"]["Enums"]["match_request_status_type"]
          target_user_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "match_requests_requestor_user_id_fkey"
            columns: ["requestor_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_requests_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_requests_target_user_id_fkey"
            columns: ["target_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body_key: string
          created_at: string
          id: string
          is_read: boolean
          notification_type: Database["public"]["Enums"]["notification_type"]
          recipient_user_id: string
          reference_id: string | null
          reference_type: string | null
          sender_user_id: string | null
          title_key: string
        }
        Insert: {
          body_key: string
          created_at?: string
          id?: string
          is_read?: boolean
          notification_type: Database["public"]["Enums"]["notification_type"]
          recipient_user_id: string
          reference_id?: string | null
          reference_type?: string | null
          sender_user_id?: string | null
          title_key: string
        }
        Update: {
          body_key?: string
          created_at?: string
          id?: string
          is_read?: boolean
          notification_type?: Database["public"]["Enums"]["notification_type"]
          recipient_user_id?: string
          reference_id?: string | null
          reference_type?: string | null
          sender_user_id?: string | null
          title_key?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_recipient_user_id_fkey"
            columns: ["recipient_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_sender_user_id_fkey"
            columns: ["sender_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      point_actions: {
        Row: {
          action_key: string
          created_at: string
          id: string
          name_en: string | null
          name_fr: string
          points_value: number
          updated_at: string
        }
        Insert: {
          action_key: string
          created_at?: string
          id?: string
          name_en?: string | null
          name_fr: string
          points_value: number
          updated_at?: string
        }
        Update: {
          action_key?: string
          created_at?: string
          id?: string
          name_en?: string | null
          name_fr?: string
          points_value?: number
          updated_at?: string
        }
        Relationships: []
      }
      post_comments: {
        Row: {
          author_user_id: string
          content: string
          created_at: string
          id: string
          post_id: string
          updated_at: string
        }
        Insert: {
          author_user_id: string
          content: string
          created_at?: string
          id?: string
          post_id: string
          updated_at?: string
        }
        Update: {
          author_user_id?: string
          content?: string
          created_at?: string
          id?: string
          post_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_comments_author_user_id_fkey"
            columns: ["author_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      post_shares: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          original_post_id: string
          sharing_user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          original_post_id: string
          sharing_user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          original_post_id?: string
          sharing_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_shares_original_post_id_fkey"
            columns: ["original_post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_shares_sharing_user_id_fkey"
            columns: ["sharing_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          author_user_id: string
          content: string
          created_at: string
          id: string
          media_url: string | null
          post_type: Database["public"]["Enums"]["post_type"]
          referenced_session_id: string | null
          referenced_user_ids: string[] | null
          title: string | null
          updated_at: string
          visibility: Database["public"]["Enums"]["post_visibility_type"]
        }
        Insert: {
          author_user_id: string
          content: string
          created_at?: string
          id?: string
          media_url?: string | null
          post_type: Database["public"]["Enums"]["post_type"]
          referenced_session_id?: string | null
          referenced_user_ids?: string[] | null
          title?: string | null
          updated_at?: string
          visibility?: Database["public"]["Enums"]["post_visibility_type"]
        }
        Update: {
          author_user_id?: string
          content?: string
          created_at?: string
          id?: string
          media_url?: string | null
          post_type?: Database["public"]["Enums"]["post_type"]
          referenced_session_id?: string | null
          referenced_user_ids?: string[] | null
          title?: string | null
          updated_at?: string
          visibility?: Database["public"]["Enums"]["post_visibility_type"]
        }
        Relationships: [
          {
            foreignKeyName: "posts_author_user_id_fkey"
            columns: ["author_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_referenced_session_id_fkey"
            columns: ["referenced_session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      session_participants: {
        Row: {
          created_at: string
          id: string
          joined_at: string
          role: Database["public"]["Enums"]["session_participant_role_type"]
          session_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          joined_at?: string
          role: Database["public"]["Enums"]["session_participant_role_type"]
          session_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          joined_at?: string
          role?: Database["public"]["Enums"]["session_participant_role_type"]
          session_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_participants_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      session_types: {
        Row: {
          created_at: string
          description_en: string | null
          description_fr: string | null
          id: string
          name_en: string | null
          name_fr: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description_en?: string | null
          description_fr?: string | null
          id?: string
          name_en?: string | null
          name_fr: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description_en?: string | null
          description_fr?: string | null
          id?: string
          name_en?: string | null
          name_fr?: string
          updated_at?: string
        }
        Relationships: []
      }
      sessions: {
        Row: {
          campus_id: string | null
          created_at: string
          description: string | null
          end_timestamp: string
          id: string
          location: string | null
          max_participants: number | null
          organizer_user_id: string
          session_type_id: string
          skill_id: string
          start_timestamp: string
          status: Database["public"]["Enums"]["session_status_type"]
          title: string
          updated_at: string
        }
        Insert: {
          campus_id?: string | null
          created_at?: string
          description?: string | null
          end_timestamp: string
          id?: string
          location?: string | null
          max_participants?: number | null
          organizer_user_id: string
          session_type_id: string
          skill_id: string
          start_timestamp: string
          status?: Database["public"]["Enums"]["session_status_type"]
          title: string
          updated_at?: string
        }
        Update: {
          campus_id?: string | null
          created_at?: string
          description?: string | null
          end_timestamp?: string
          id?: string
          location?: string | null
          max_participants?: number | null
          organizer_user_id?: string
          session_type_id?: string
          skill_id?: string
          start_timestamp?: string
          status?: Database["public"]["Enums"]["session_status_type"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sessions_campus_id_fkey"
            columns: ["campus_id"]
            isOneToOne: false
            referencedRelation: "campuses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_organizer_user_id_fkey"
            columns: ["organizer_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_session_type_id_fkey"
            columns: ["session_type_id"]
            isOneToOne: false
            referencedRelation: "session_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
      }
      skills: {
        Row: {
          created_at: string
          created_by_user_id: string | null
          id: string
          is_verified: boolean
          name_en: string | null
          name_fr: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by_user_id?: string | null
          id?: string
          is_verified?: boolean
          name_en?: string | null
          name_fr: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by_user_id?: string | null
          id?: string
          is_verified?: boolean
          name_en?: string | null
          name_fr?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "skills_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_badges: {
        Row: {
          awarded_at: string
          badge_id: string
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          awarded_at?: string
          badge_id: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          awarded_at?: string
          badge_id?: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_badges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_challenges: {
        Row: {
          challenge_id: string
          completed_at: string | null
          created_at: string
          current_progress: number
          id: string
          status: Database["public"]["Enums"]["challenge_status_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          challenge_id: string
          completed_at?: string | null
          created_at?: string
          current_progress?: number
          id?: string
          status?: Database["public"]["Enums"]["challenge_status_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          challenge_id?: string
          completed_at?: string | null
          created_at?: string
          current_progress?: number
          id?: string
          status?: Database["public"]["Enums"]["challenge_status_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_challenges_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_challenges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_points_ledger: {
        Row: {
          created_at: string
          id: string
          point_action_id: string
          points_earned: number
          reference_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          point_action_id: string
          points_earned: number
          reference_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          point_action_id?: string
          points_earned?: number
          reference_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_points_ledger_point_action_id_fkey"
            columns: ["point_action_id"]
            isOneToOne: false
            referencedRelation: "point_actions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_points_ledger_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
          avatar_url: string | null
          bio: string | null
          created_at: string
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          suspended_at: string | null
          updated_at: string
        }
        Insert: {
          academic_level_id?: string | null
          auth_id: string
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          suspended_at?: string | null
          updated_at?: string
        }
        Update: {
          academic_level_id?: string | null
          auth_id?: string
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          suspended_at?: string | null
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
      challenge_status_type: "IN_PROGRESS" | "COMPLETED" | "FAILED" | "EXPIRED"
      match_outcome_type: "COMPLETED" | "EXPIRED" | "WITHDRAWN"
      match_request_status_type:
        | "PENDING"
        | "ACCEPTED"
        | "REJECTED"
        | "CANCELLED"
      notification_type:
        | "MATCH_REQUEST"
        | "MATCH_ACCEPTED"
        | "SESSION_INVITE"
        | "SESSION_REMINDER"
        | "BADGE_EARNED"
        | "CHALLENGE_COMPLETED"
        | "FRIEND_REQUEST"
        | "POST_LIKE"
        | "POST_COMMENT"
        | "POST_SHARE"
        | "ADMIN_BROADCAST"
        | "ACCOUNT_SUSPENDED"
        | "CONTENT_REMOVED"
        | "DIRECT_MESSAGE"
      post_type: "ACHIEVEMENT" | "RECOMMENDATION" | "FEEDBACK"
      post_visibility_type: "PUBLIC" | "FRIENDS_ONLY"
      report_status_type: "PENDING" | "RESOLVED" | "DISMISSED"
      session_participant_role_type: "ORGANIZER" | "TEACHER" | "LEARNER"
      session_status_type: "PLANNED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED"
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
      challenge_status_type: ["IN_PROGRESS", "COMPLETED", "FAILED", "EXPIRED"],
      match_outcome_type: ["COMPLETED", "EXPIRED", "WITHDRAWN"],
      match_request_status_type: [
        "PENDING",
        "ACCEPTED",
        "REJECTED",
        "CANCELLED",
      ],
      notification_type: [
        "MATCH_REQUEST",
        "MATCH_ACCEPTED",
        "SESSION_INVITE",
        "SESSION_REMINDER",
        "BADGE_EARNED",
        "CHALLENGE_COMPLETED",
        "FRIEND_REQUEST",
        "POST_LIKE",
        "POST_COMMENT",
        "POST_SHARE",
        "ADMIN_BROADCAST",
        "ACCOUNT_SUSPENDED",
        "CONTENT_REMOVED",
        "DIRECT_MESSAGE",
      ],
      post_type: ["ACHIEVEMENT", "RECOMMENDATION", "FEEDBACK"],
      post_visibility_type: ["PUBLIC", "FRIENDS_ONLY"],
      report_status_type: ["PENDING", "RESOLVED", "DISMISSED"],
      session_participant_role_type: ["ORGANIZER", "TEACHER", "LEARNER"],
      session_status_type: ["PLANNED", "IN_PROGRESS", "COMPLETED", "CANCELLED"],
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
