export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      app_settings: {
        Row: {
          created_at: string
          key: string
          updated_at: string
          value: string | null
        }
        Insert: {
          created_at?: string
          key: string
          updated_at?: string
          value?: string | null
        }
        Update: {
          created_at?: string
          key?: string
          updated_at?: string
          value?: string | null
        }
        Relationships: []
      }
      company_profiles: {
        Row: {
          about: string
          address: string
          company_name: string
          created_at: string
          facebook_url: string | null
          id: string
          instagram_url: string | null
          linkedin_url: string | null
          maps_url: string | null
          office_phone_number: string | null
          phone_number: string
          updated_at: string
          user_id: string
          user_subscription_id: string
          youtube_url: string | null
        }
        Insert: {
          about: string
          address: string
          company_name: string
          created_at?: string
          facebook_url?: string | null
          id?: string
          instagram_url?: string | null
          linkedin_url?: string | null
          maps_url?: string | null
          office_phone_number?: string | null
          phone_number: string
          updated_at?: string
          user_id: string
          user_subscription_id: string
          youtube_url?: string | null
        }
        Update: {
          about?: string
          address?: string
          company_name?: string
          created_at?: string
          facebook_url?: string | null
          id?: string
          instagram_url?: string | null
          linkedin_url?: string | null
          maps_url?: string | null
          office_phone_number?: string | null
          phone_number?: string
          updated_at?: string
          user_id?: string
          user_subscription_id?: string
          youtube_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_profiles_user_subscription_id_fkey"
            columns: ["user_subscription_id"]
            isOneToOne: true
            referencedRelation: "user_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      company_services: {
        Row: {
          company_profile_id: string
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          company_profile_id: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          company_profile_id?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_services_company_profile_id_fkey"
            columns: ["company_profile_id"]
            isOneToOne: false
            referencedRelation: "company_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cv_portfolios: {
        Row: {
          address: string
          created_at: string
          facebook_url: string | null
          full_name: string
          id: string
          instagram_url: string | null
          linkedin_url: string | null
          phone_number: string
          skills: string | null
          updated_at: string
          user_id: string
          user_subscription_id: string
          youtube_url: string | null
        }
        Insert: {
          address: string
          created_at?: string
          facebook_url?: string | null
          full_name: string
          id?: string
          instagram_url?: string | null
          linkedin_url?: string | null
          phone_number: string
          skills?: string | null
          updated_at?: string
          user_id: string
          user_subscription_id: string
          youtube_url?: string | null
        }
        Update: {
          address?: string
          created_at?: string
          facebook_url?: string | null
          full_name?: string
          id?: string
          instagram_url?: string | null
          linkedin_url?: string | null
          phone_number?: string
          skills?: string | null
          updated_at?: string
          user_id?: string
          user_subscription_id?: string
          youtube_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cv_portfolios_user_subscription_id_fkey"
            columns: ["user_subscription_id"]
            isOneToOne: true
            referencedRelation: "user_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      digital_invitations: {
        Row: {
          bride_name: string
          ceremony_date: string
          ceremony_location: string
          ceremony_time: string
          created_at: string
          groom_name: string
          id: string
          reception_date: string | null
          reception_location: string | null
          reception_time: string | null
          updated_at: string
          user_id: string
          user_subscription_id: string
        }
        Insert: {
          bride_name: string
          ceremony_date: string
          ceremony_location: string
          ceremony_time: string
          created_at?: string
          groom_name: string
          id?: string
          reception_date?: string | null
          reception_location?: string | null
          reception_time?: string | null
          updated_at?: string
          user_id: string
          user_subscription_id: string
        }
        Update: {
          bride_name?: string
          ceremony_date?: string
          ceremony_location?: string
          ceremony_time?: string
          created_at?: string
          groom_name?: string
          id?: string
          reception_date?: string | null
          reception_location?: string | null
          reception_time?: string | null
          updated_at?: string
          user_id?: string
          user_subscription_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "digital_invitations_user_subscription_id_fkey"
            columns: ["user_subscription_id"]
            isOneToOne: true
            referencedRelation: "user_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      managed_products: {
        Row: {
          category: string
          created_at: string
          demo_url: string | null
          description: string | null
          features: string[] | null
          id: string
          image_url: string | null
          name: string
          pricing: Json
          type: Database["public"]["Enums"]["product_type_enum"]
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          demo_url?: string | null
          description?: string | null
          features?: string[] | null
          id?: string
          image_url?: string | null
          name: string
          pricing: Json
          type: Database["public"]["Enums"]["product_type_enum"]
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          demo_url?: string | null
          description?: string | null
          features?: string[] | null
          id?: string
          image_url?: string | null
          name?: string
          pricing?: Json
          type?: Database["public"]["Enums"]["product_type_enum"]
          updated_at?: string
        }
        Relationships: []
      }
      managed_services: {
        Row: {
          category: string
          created_at: string
          description: string | null
          duration: string | null
          features: string[] | null
          icon_name: string | null
          id: string
          name: string
          pricing: string | null
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          duration?: string | null
          features?: string[] | null
          icon_name?: string | null
          id?: string
          name: string
          pricing?: string | null
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          duration?: string | null
          features?: string[] | null
          icon_name?: string | null
          id?: string
          name?: string
          pricing?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      product_files: {
        Row: {
          created_at: string
          file_name: string
          html_content: string | null
          id: string
          product_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          file_name: string
          html_content?: string | null
          id?: string
          product_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          file_name?: string
          html_content?: string | null
          id?: string
          product_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_files_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "managed_products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_previews: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          product_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id?: string
          product_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_previews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "managed_products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: string
          created_at: string
          demo_url: string | null
          description: string | null
          features: string[] | null
          id: number
          image_url: string | null
          name: string
          period: string
          price: string
          type: Database["public"]["Enums"]["product_type_enum"]
        }
        Insert: {
          category: string
          created_at?: string
          demo_url?: string | null
          description?: string | null
          features?: string[] | null
          id?: number
          image_url?: string | null
          name: string
          period: string
          price: string
          type: Database["public"]["Enums"]["product_type_enum"]
        }
        Update: {
          category?: string
          created_at?: string
          demo_url?: string | null
          description?: string | null
          features?: string[] | null
          id?: number
          image_url?: string | null
          name?: string
          period?: string
          price?: string
          type?: Database["public"]["Enums"]["product_type_enum"]
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      store_details: {
        Row: {
          about_store: string | null
          created_at: string
          facebook_url: string | null
          id: string
          instagram_url: string | null
          linkedin_url: string | null
          location: string | null
          phone_number: string | null
          store_address: string | null
          store_name: string | null
          updated_at: string
          user_id: string
          user_subscription_id: string
          youtube_url: string | null
        }
        Insert: {
          about_store?: string | null
          created_at?: string
          facebook_url?: string | null
          id?: string
          instagram_url?: string | null
          linkedin_url?: string | null
          location?: string | null
          phone_number?: string | null
          store_address?: string | null
          store_name?: string | null
          updated_at?: string
          user_id: string
          user_subscription_id: string
          youtube_url?: string | null
        }
        Update: {
          about_store?: string | null
          created_at?: string
          facebook_url?: string | null
          id?: string
          instagram_url?: string | null
          linkedin_url?: string | null
          location?: string | null
          phone_number?: string | null
          store_address?: string | null
          store_name?: string | null
          updated_at?: string
          user_id?: string
          user_subscription_id?: string
          youtube_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "store_details_user_subscription_id_fkey"
            columns: ["user_subscription_id"]
            isOneToOne: true
            referencedRelation: "user_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      store_products: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          name: string
          price: number
          store_details_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          price: number
          store_details_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          price?: number
          store_details_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "store_products_store_details_id_fkey"
            columns: ["store_details_id"]
            isOneToOne: false
            referencedRelation: "store_details"
            referencedColumns: ["id"]
          },
        ]
      }
      user_generated_files: {
        Row: {
          created_at: string
          file_name: string
          html_content: string | null
          id: string
          updated_at: string
          user_subscription_id: string
        }
        Insert: {
          created_at?: string
          file_name: string
          html_content?: string | null
          id?: string
          updated_at?: string
          user_subscription_id: string
        }
        Update: {
          created_at?: string
          file_name?: string
          html_content?: string | null
          id?: string
          updated_at?: string
          user_subscription_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_generated_files_user_subscription_id_fkey"
            columns: ["user_subscription_id"]
            isOneToOne: false
            referencedRelation: "user_subscriptions"
            referencedColumns: ["id"]
          },
        ]
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
          role?: Database["public"]["Enums"]["app_role"]
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
      user_subscriptions: {
        Row: {
          created_at: string
          customer_email: string
          customer_name: string
          customer_phone: string
          expires_at: string | null
          id: string
          payment_method_selected: string | null
          payment_proof_url: string | null
          product_category: string
          product_name: string
          product_period: string
          product_price: string
          product_static_id: number
          product_type: string
          rejection_reason: string | null
          subscribed_at: string
          subscription_status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          customer_email: string
          customer_name: string
          customer_phone: string
          expires_at?: string | null
          id?: string
          payment_method_selected?: string | null
          payment_proof_url?: string | null
          product_category: string
          product_name: string
          product_period: string
          product_price: string
          product_static_id: number
          product_type: string
          rejection_reason?: string | null
          subscribed_at?: string
          subscription_status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          customer_email?: string
          customer_name?: string
          customer_phone?: string
          expires_at?: string | null
          id?: string
          payment_method_selected?: string | null
          payment_proof_url?: string | null
          product_category?: string
          product_name?: string
          product_period?: string
          product_price?: string
          product_static_id?: number
          product_type?: string
          rejection_reason?: string | null
          subscribed_at?: string
          subscription_status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      work_experiences: {
        Row: {
          company_name: string
          created_at: string
          cv_portfolio_id: string
          id: string
          job_description: string | null
          job_period: string
          updated_at: string
          user_id: string
        }
        Insert: {
          company_name: string
          created_at?: string
          cv_portfolio_id: string
          id?: string
          job_description?: string | null
          job_period: string
          updated_at?: string
          user_id: string
        }
        Update: {
          company_name?: string
          created_at?: string
          cv_portfolio_id?: string
          id?: string
          job_description?: string | null
          job_period?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_experiences_cv_portfolio_id_fkey"
            columns: ["cv_portfolio_id"]
            isOneToOne: false
            referencedRelation: "cv_portfolios"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_random_managed_products: {
        Args: { limit_count: number }
        Returns: {
          category: string
          created_at: string
          demo_url: string | null
          description: string | null
          features: string[] | null
          id: string
          image_url: string | null
          name: string
          pricing: Json
          type: Database["public"]["Enums"]["product_type_enum"]
          updated_at: string
        }[]
      }
      get_random_store_products: {
        Args: { limit_count: number }
        Returns: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          name: string
          price: number
          store_details_id: string
          updated_at: string
          user_id: string
        }[]
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "member"
      product_type_enum: "Premium" | "Non-Premium"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "member"],
      product_type_enum: ["Premium", "Non-Premium"],
    },
  },
} as const
