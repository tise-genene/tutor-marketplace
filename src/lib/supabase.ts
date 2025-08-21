import { createClient } from '@supabase/supabase-js';

// Ensure environment variables are available
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://uwqrntsuwajugnizogbm.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3cXJudHN1d2FqdWduaXpvZ2JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3NzQwNTIsImV4cCI6MjA3MTM1MDA1Mn0.piV8l7WPo6LxQm19C1rD4Kllbacr_dZw-8n4j4T23uE';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Database types (will be generated from Supabase)
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string;
          email: string;
          role: 'STUDENT' | 'TUTOR' | 'ADMIN';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          role?: 'STUDENT' | 'TUTOR' | 'ADMIN';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          role?: 'STUDENT' | 'TUTOR' | 'ADMIN';
          created_at?: string;
          updated_at?: string;
        };
      };
      subjects: {
        Row: {
          id: string;
          name: string;
          category: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          category: string;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          category?: string;
          description?: string | null;
          created_at?: string;
        };
      };
      tutor_profiles: {
        Row: {
          id: string;
          user_id: string;
          bio: string | null;
          education: string;
          experience: number;
          location: string;
          availability: string;
          is_verified: boolean;
          rating: number;
          total_reviews: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          bio?: string | null;
          education: string;
          experience?: number;
          location: string;
          availability: string;
          is_verified?: boolean;
          rating?: number;
          total_reviews?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          bio?: string | null;
          education?: string;
          experience?: number;
          location?: string;
          availability?: string;
          is_verified?: boolean;
          rating?: number;
          total_reviews?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      bookings: {
        Row: {
          id: string;
          student_id: string;
          tutor_id: string;
          subject_id: string;
          date: string;
          start_time: string;
          end_time: string;
          status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
          notes: string | null;
          hourly_rate: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          tutor_id: string;
          subject_id: string;
          date: string;
          start_time: string;
          end_time: string;
          status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
          notes?: string | null;
          hourly_rate: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          tutor_id?: string;
          subject_id?: string;
          date?: string;
          start_time?: string;
          end_time?: string;
          status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
          notes?: string | null;
          hourly_rate?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          content: string;
          type: 'TEXT' | 'FILE' | 'VOICE';
          created_at: string;
          read: boolean;
          file_name: string | null;
          file_type: string | null;
          file_url: string | null;
          voice_duration: number | null;
          sender_id: string;
          receiver_id: string;
        };
        Insert: {
          id?: string;
          content: string;
          type?: 'TEXT' | 'FILE' | 'VOICE';
          created_at?: string;
          read?: boolean;
          file_name?: string | null;
          file_type?: string | null;
          file_url?: string | null;
          voice_duration?: number | null;
          sender_id: string;
          receiver_id: string;
        };
        Update: {
          id?: string;
          content?: string;
          type?: 'TEXT' | 'FILE' | 'VOICE';
          created_at?: string;
          read?: boolean;
          file_name?: string | null;
          file_type?: string | null;
          file_url?: string | null;
          voice_duration?: number | null;
          sender_id?: string;
          receiver_id?: string;
        };
      };
      calendar_events: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          start_time: string;
          end_time: string;
          type: 'SESSION' | 'AVAILABILITY' | 'REMINDER' | 'CUSTOM';
          status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
          location: string | null;
          meeting_url: string | null;
          tutor_id: string | null;
          student_id: string | null;
          subject_id: string | null;
          booking_id: string | null;
          is_recurring: boolean;
          recurrence_rule: string | null;
          color: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          start_time: string;
          end_time: string;
          type: 'SESSION' | 'AVAILABILITY' | 'REMINDER' | 'CUSTOM';
          status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
          location?: string | null;
          meeting_url?: string | null;
          tutor_id?: string | null;
          student_id?: string | null;
          subject_id?: string | null;
          booking_id?: string | null;
          is_recurring?: boolean;
          recurrence_rule?: string | null;
          color?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          start_time?: string;
          end_time?: string;
          type?: 'SESSION' | 'AVAILABILITY' | 'REMINDER' | 'CUSTOM';
          status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
          location?: string | null;
          meeting_url?: string | null;
          tutor_id?: string | null;
          student_id?: string | null;
          subject_id?: string | null;
          booking_id?: string | null;
          is_recurring?: boolean;
          recurrence_rule?: string | null;
          color?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type InsertDto<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type UpdateDto<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];
