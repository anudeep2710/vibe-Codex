import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Optional: Create client only if credentials are provided
export const supabase = (supabaseUrl && supabaseAnonKey)
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true
        }
    })
    : null;

// Helper to check if Supabase is configured
export const isSupabaseConfigured = () => supabase !== null;

// Database types
export interface Project {
    id: string;
    user_id: string;
    name: string;
    description: string | null;
    created_at: string;
    updated_at: string;
    is_public: boolean;
    tags: string[];
    last_accessed_at: string;
}

export interface FileRecord {
    id: string;
    project_id: string;
    path: string;
    content: string | null;
    language: string | null;
    created_at: string;
    updated_at: string;
    size_bytes: number;
}

export interface ExecutionHistory {
    id: string;
    user_id: string;
    project_id: string | null;
    code: string;
    language: string;
    stdin: string | null;
    stdout: string | null;
    stderr: string | null;
    status: string | null;
    execution_time_ms: number | null;
    memory_kb: number | null;
    executed_at: string;
}

export interface UserPreferences {
    user_id: string;
    theme: string;
    editor_font_size: number;
    editor_theme: string;
    auto_save: boolean;
    auto_save_interval_seconds: number;
    show_onboarding: boolean;
    created_at: string;
    updated_at: string;
}
