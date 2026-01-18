export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      plans: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          target_date: string | null;
          status: 'active' | 'completed' | 'archived';
          priority: 'high' | 'medium' | 'low';
          order_index: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          target_date?: string | null;
          status?: 'active' | 'completed' | 'archived';
          priority?: 'high' | 'medium' | 'low';
          order_index?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          target_date?: string | null;
          status?: 'active' | 'completed' | 'archived';
          priority?: 'high' | 'medium' | 'low';
          order_index?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      steps: {
        Row: {
          id: string;
          plan_id: string;
          title: string;
          description: string | null;
          due_date: string | null;
          order_index: number;
          status: 'pending' | 'in_progress' | 'completed';
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          plan_id: string;
          title: string;
          description?: string | null;
          due_date?: string | null;
          order_index: number;
          status?: 'pending' | 'in_progress' | 'completed';
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          plan_id?: string;
          title?: string;
          description?: string | null;
          due_date?: string | null;
          order_index?: number;
          status?: 'pending' | 'in_progress' | 'completed';
          notes?: string | null;
          created_at?: string;
        };
      };
      chat_sessions: {
        Row: {
          id: string;
          user_id: string;
          plan_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          plan_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          plan_id?: string | null;
          created_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          session_id: string;
          role: 'user' | 'assistant';
          content: string;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          role: 'user' | 'assistant';
          content: string;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          role?: 'user' | 'assistant';
          content?: string;
          metadata?: Json | null;
          created_at?: string;
        };
      };
    };
  };
}

// Helper types
export type Plan = Database['public']['Tables']['plans']['Row'];
export type PlanInsert = Database['public']['Tables']['plans']['Insert'];
export type Step = Database['public']['Tables']['steps']['Row'];
export type StepInsert = Database['public']['Tables']['steps']['Insert'];
export type ChatSession = Database['public']['Tables']['chat_sessions']['Row'];
export type Message = Database['public']['Tables']['messages']['Row'];
export type Priority = 'high' | 'medium' | 'low';
