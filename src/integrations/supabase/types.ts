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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      analytics_events: {
        Row: {
          created_at: string
          event_data: Json | null
          event_name: string | null
          event_type: string
          id: string
          page_path: string | null
          referrer: string | null
          session_id: string | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          event_data?: Json | null
          event_name?: string | null
          event_type: string
          id?: string
          page_path?: string | null
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          event_data?: Json | null
          event_name?: string | null
          event_type?: string
          id?: string
          page_path?: string | null
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      client_error_logs: {
        Row: {
          build_version: string | null
          created_at: string
          error_type: string
          has_service_worker: boolean | null
          id: string
          in_iframe: boolean | null
          message: string
          page_path: string | null
          session_id: string | null
          user_agent: string | null
        }
        Insert: {
          build_version?: string | null
          created_at?: string
          error_type: string
          has_service_worker?: boolean | null
          id?: string
          in_iframe?: boolean | null
          message: string
          page_path?: string | null
          session_id?: string | null
          user_agent?: string | null
        }
        Update: {
          build_version?: string | null
          created_at?: string
          error_type?: string
          has_service_worker?: boolean | null
          id?: string
          in_iframe?: boolean | null
          message?: string
          page_path?: string | null
          session_id?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          ip_address: unknown
          message: string
          name: string
          phone: string | null
          read_at: string | null
          subject: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          ip_address?: unknown
          message: string
          name: string
          phone?: string | null
          read_at?: string | null
          subject: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          ip_address?: unknown
          message?: string
          name?: string
          phone?: string | null
          read_at?: string | null
          subject?: string
        }
        Relationships: []
      }
      organization_members: {
        Row: {
          created_at: string
          id: string
          organization_id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          organization_id: string
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          organization_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          id: string
          name: string
          plan: string
          settings: Json
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          plan?: string
          settings?: Json
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          plan?: string
          settings?: Json
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      rate_limit_buckets: {
        Row: {
          bucket_key: string
          count: number
          created_at: string
          expires_at: string
          id: string
          window_start: string
        }
        Insert: {
          bucket_key: string
          count?: number
          created_at?: string
          expires_at: string
          id?: string
          window_start?: string
        }
        Update: {
          bucket_key?: string
          count?: number
          created_at?: string
          expires_at?: string
          id?: string
          window_start?: string
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          action: string
          created_at: string
          id: string
          resource: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          resource: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          resource?: string
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_hq_chat_message: {
        Args: { p_content: string; p_conversation_id: string; p_role: string }
        Returns: string
      }
      approve_hq_action: {
        Args: { p_action_id: string; p_decision: string; p_reason?: string }
        Returns: boolean
      }
      check_ip_rate_limit: {
        Args: {
          p_bucket_key: string
          p_max_requests?: number
          p_window_seconds?: number
        }
        Returns: Json
      }
      create_hq_conversation: { Args: { p_title?: string }; Returns: string }
      create_hq_journal_entry: {
        Args: {
          p_content?: string
          p_entry_type?: string
          p_linked_kpis?: Json
          p_tags?: string[]
          p_title: string
        }
        Returns: string
      }
      create_studio_call: {
        Args: {
          p_call_type: string
          p_deadline?: string
          p_domain?: string
          p_eligibility?: string
          p_estimated_budget?: string
          p_issuer?: string
          p_source_url?: string
          p_title: string
        }
        Returns: string
      }
      create_studio_opportunity: {
        Args: {
          p_description?: string
          p_domain?: string
          p_problem_statement?: string
          p_source_type?: string
          p_source_url?: string
          p_title: string
        }
        Returns: string
      }
      current_user_org_id: { Args: never; Returns: string }
      delete_hq_conversation: {
        Args: { p_conversation_id: string }
        Returns: boolean
      }
      delete_hq_journal_entry: { Args: { p_id: string }; Returns: boolean }
      enqueue_dlq_run: {
        Args: {
          p_failure_reason?: string
          p_original_run_id: string
          p_payload?: Json
          p_platform_key?: string
          p_run_type: string
        }
        Returns: string
      }
      get_active_push_subscriptions: {
        Args: never
        Returns: {
          auth_key: string
          endpoint: string
          id: string
          p256dh: string
        }[]
      }
      get_all_hq_platforms: {
        Args: never
        Returns: {
          created_at: string
          description: string
          github_url: string
          id: string
          key: string
          last_release_at: string
          name: string
          status: string
          status_reason: string
          updated_at: string
          uptime_percent: number
        }[]
      }
      get_dlq_pending: {
        Args: { limit_count?: number }
        Returns: {
          attempts: number
          created_at: string
          failure_reason: string
          id: string
          max_attempts: number
          next_retry_at: string
          original_run_id: string
          payload: Json
          platform_key: string
          run_type: string
        }[]
      }
      get_hq_agents: {
        Args: never
        Returns: {
          created_at: string
          id: string
          is_enabled: boolean
          model_preference: string
          name: string
          role_category: string
          role_key: string
          role_title_fr: string
          updated_at: string
        }[]
      }
      get_hq_ai_budget_status: { Args: never; Returns: Json }
      get_hq_audit_logs: {
        Args: { limit_count?: number }
        Returns: {
          action: string
          actor_id: string
          actor_type: string
          created_at: string
          details: Json
          id: string
          ip_address: unknown
          resource_id: string
          resource_type: string
        }[]
      }
      get_hq_chat_messages: {
        Args: { p_conversation_id: string }
        Returns: {
          content: string
          created_at: string
          id: string
          role: string
        }[]
      }
      get_hq_conversations: {
        Args: { limit_count?: number }
        Returns: {
          created_at: string
          id: string
          last_message: string
          title: string
          updated_at: string
        }[]
      }
      get_hq_dlq_entries: {
        Args: { limit_count?: number }
        Returns: {
          attempts: number
          created_at: string
          failure_reason: string
          id: string
          last_error: string
          max_attempts: number
          next_retry_at: string
          original_run_id: string
          platform_key: string
          resolved_at: string
          run_type: string
          status: string
        }[]
      }
      get_hq_governance_dashboard: { Args: never; Returns: Json }
      get_hq_journal_entries: {
        Args: { limit_count?: number }
        Returns: {
          content: string
          created_at: string
          entry_type: string
          id: string
          impact_measured: Json
          is_pinned: boolean
          linked_kpis: Json
          tags: string[]
          title: string
          updated_at: string
        }[]
      }
      get_hq_logs: {
        Args: {
          level_filter?: string
          limit_count?: number
          source_filter?: string
        }
        Returns: {
          created_at: string
          id: string
          level: string
          message: string
          metadata: Json
          run_id: string
          source: string
        }[]
      }
      get_hq_morning_digest: {
        Args: { p_date?: string }
        Returns: {
          created_at: string
          data_sources: string[]
          digest_date: string
          executive_summary: string
          generation_duration_ms: number
          id: string
          model_used: string
          sections: Json
          triggered_by: string
        }[]
      }
      get_hq_org_roles: {
        Args: never
        Returns: {
          category: string
          created_at: string
          description: string
          id: string
          key: string
          title: string
          title_fr: string
        }[]
      }
      get_hq_pending_actions: {
        Args: never
        Returns: {
          action_type: string
          agent_id: string
          created_at: string
          description: string
          executed_at: string
          id: string
          payload: Json
          requires_approval: boolean
          risk_level: string
          run_id: string
          status: string
          title: string
        }[]
      }
      get_hq_platform: {
        Args: { platform_key_param: string }
        Returns: {
          created_at: string
          description: string
          github_url: string
          id: string
          key: string
          last_release_at: string
          name: string
          status: string
          status_reason: string
          updated_at: string
          uptime_percent: number
        }[]
      }
      get_hq_recent_runs: {
        Args: { limit_count?: number }
        Returns: {
          completed_at: string
          created_at: string
          detailed_appendix: Json
          director_agent_id: string
          executive_summary: string
          id: string
          owner_requested: boolean
          platform_key: string
          run_type: string
          started_at: string
          status: string
        }[]
      }
      get_hq_run_duration_metrics: { Args: never; Returns: Json }
      get_hq_slo_status: { Args: never; Returns: Json }
      get_hq_system_config: { Args: { config_key: string }; Returns: Json }
      get_hq_top_run_costs: { Args: { p_window_days?: number }; Returns: Json }
      get_studio_overview: { Args: never; Returns: Json }
      get_user_permissions: {
        Args: { _user_id: string }
        Returns: {
          action: string
          resource: string
        }[]
      }
      has_org_access: {
        Args: { _org_id: string; _user_id: string }
        Returns: boolean
      }
      has_permission: {
        Args: { _action: string; _resource: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      insert_hq_log: {
        Args: {
          p_level?: string
          p_message?: string
          p_metadata?: Json
          p_run_id?: string
          p_source?: string
        }
        Returns: string
      }
      insert_hq_run: {
        Args: {
          p_detailed_appendix?: Json
          p_executive_summary?: string
          p_owner_requested?: boolean
          p_platform_key?: string
          p_run_type: string
          p_status?: string
        }
        Returns: string
      }
      is_owner: { Args: never; Returns: boolean }
      list_studio_advisory: {
        Args: never
        Returns: unknown[]
        SetofOptions: {
          from: "*"
          to: "studio_advisory"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      list_studio_blueprints: {
        Args: never
        Returns: unknown[]
        SetofOptions: {
          from: "*"
          to: "studio_blueprints"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      list_studio_calls: {
        Args: never
        Returns: unknown[]
        SetofOptions: {
          from: "*"
          to: "studio_calls"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      list_studio_deals: {
        Args: never
        Returns: unknown[]
        SetofOptions: {
          from: "*"
          to: "studio_deals"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      list_studio_documents: {
        Args: never
        Returns: unknown[]
        SetofOptions: {
          from: "*"
          to: "studio_documents"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      list_studio_opportunities: {
        Args: never
        Returns: unknown[]
        SetofOptions: {
          from: "*"
          to: "studio_opportunities"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      mark_dlq_attempt: {
        Args: { p_dlq_id: string; p_error?: string; p_outcome: string }
        Returns: boolean
      }
      purge_old_hq_logs: { Args: { retention_days?: number }; Returns: number }
      purge_rate_limit_buckets: { Args: never; Returns: number }
      remove_push_subscription: {
        Args: { p_endpoint: string }
        Returns: boolean
      }
      save_push_subscription: {
        Args: {
          p_auth_key: string
          p_device_label?: string
          p_endpoint: string
          p_p256dh: string
          p_user_agent?: string
        }
        Returns: string
      }
      update_hq_journal_entry: {
        Args: {
          p_content?: string
          p_id: string
          p_impact_measured?: Json
          p_is_pinned?: boolean
          p_tags?: string[]
          p_title?: string
        }
        Returns: boolean
      }
      update_hq_system_config: {
        Args: { p_key: string; p_value: Json }
        Returns: boolean
      }
      upsert_hq_morning_digest: {
        Args: {
          p_data_sources?: string[]
          p_executive_summary: string
          p_generation_duration_ms?: number
          p_model_used?: string
          p_sections?: Json
          p_triggered_by?: string
        }
        Returns: string
      }
    }
    Enums: {
      app_role:
        | "owner"
        | "admin"
        | "finance"
        | "marketing"
        | "support"
        | "product"
        | "engineering"
        | "viewer"
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
      app_role: [
        "owner",
        "admin",
        "finance",
        "marketing",
        "support",
        "product",
        "engineering",
        "viewer",
      ],
    },
  },
} as const
