/**
 * Generated from Supabase `public` schema via mcp__generate_typescript_types.
 * Regenerar al cambiar el schema public (auth flow, billing).
 *
 * Para el schema `simulador` (multi-tenant), ver lib/simulador/types.ts.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "13.0.5";
  };
  public: {
    Tables: {
      enterprise_leads: {
        Row: {
          company: string;
          created_at: string;
          email: string;
          id: string;
          name: string;
          notes: string | null;
          questionnaire: Json;
          source: string;
          status: string;
          updated_at: string;
        };
        Insert: {
          company: string;
          created_at?: string;
          email: string;
          id?: string;
          name: string;
          notes?: string | null;
          questionnaire?: Json;
          source?: string;
          status?: string;
          updated_at?: string;
        };
        Update: {
          company?: string;
          created_at?: string;
          email?: string;
          id?: string;
          name?: string;
          notes?: string | null;
          questionnaire?: Json;
          source?: string;
          status?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      payments: {
        Row: {
          amount: number;
          created_at: string | null;
          currency: string | null;
          id: string;
          metadata: Json | null;
          provider: string;
          provider_payment_id: string | null;
          status: string | null;
          tier: string | null;
          updated_at: string | null;
          user_id: string | null;
        };
        Insert: {
          amount: number;
          created_at?: string | null;
          currency?: string | null;
          id?: string;
          metadata?: Json | null;
          provider: string;
          provider_payment_id?: string | null;
          status?: string | null;
          tier?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          amount?: number;
          created_at?: string | null;
          currency?: string | null;
          id?: string;
          metadata?: Json | null;
          provider?: string;
          provider_payment_id?: string | null;
          status?: string | null;
          tier?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "payments_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      stripe_webhook_events: {
        Row: {
          event_id: string;
          event_type: string;
          processed_at: string;
        };
        Insert: {
          event_id: string;
          event_type: string;
          processed_at?: string;
        };
        Update: {
          event_id?: string;
          event_type?: string;
          processed_at?: string;
        };
        Relationships: [];
      };
      users: {
        Row: {
          acquisition_channel: string | null;
          cancel_at_period_end: boolean;
          created_at: string | null;
          current_period_end: string | null;
          email: string;
          id: string;
          name: string | null;
          phone: string | null;
          phone_consent_at: string | null;
          phone_verified: boolean | null;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          subscription_active: boolean;
          subscription_plan: string | null;
          subscription_status: string | null;
          tier: string | null;
          updated_at: string | null;
          welcome_email_sent_at: string | null;
          whatsapp_id: string | null;
        };
        Insert: {
          acquisition_channel?: string | null;
          cancel_at_period_end?: boolean;
          created_at?: string | null;
          current_period_end?: string | null;
          email: string;
          id: string;
          name?: string | null;
          phone?: string | null;
          phone_consent_at?: string | null;
          phone_verified?: boolean | null;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          subscription_active?: boolean;
          subscription_plan?: string | null;
          subscription_status?: string | null;
          tier?: string | null;
          updated_at?: string | null;
          welcome_email_sent_at?: string | null;
          whatsapp_id?: string | null;
        };
        Update: {
          acquisition_channel?: string | null;
          cancel_at_period_end?: boolean;
          created_at?: string | null;
          current_period_end?: string | null;
          email?: string;
          id?: string;
          name?: string | null;
          phone?: string | null;
          phone_consent_at?: string | null;
          phone_verified?: boolean | null;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          subscription_active?: boolean;
          subscription_plan?: string | null;
          subscription_status?: string | null;
          tier?: string | null;
          updated_at?: string | null;
          welcome_email_sent_at?: string | null;
          whatsapp_id?: string | null;
        };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
