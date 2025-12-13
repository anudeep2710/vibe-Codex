-- ============================================
-- Vibe Code-X Database Schema
-- Supabase PostgreSQL Setup
-- ============================================

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. PROJECTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_public BOOLEAN DEFAULT FALSE,
  tags TEXT[] DEFAULT '{}',
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT projects_name_check CHECK (char_length(name) > 0 AND char_length(name) <= 200)
);

-- Indexes for projects table
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_is_public ON projects(is_public) WHERE is_public = TRUE;
CREATE INDEX IF NOT EXISTS idx_projects_tags ON projects USING GIN(tags);

-- ============================================
-- 2. FILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  path TEXT NOT NULL,
  content TEXT,
  language TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  size_bytes INTEGER DEFAULT 0,
  CONSTRAINT files_path_check CHECK (char_length(path) > 0),
  CONSTRAINT files_unique_path_per_project UNIQUE(project_id, path)
);

-- Indexes for files table
CREATE INDEX IF NOT EXISTS idx_files_project_id ON files(project_id);
CREATE INDEX IF NOT EXISTS idx_files_language ON files(language);

-- ============================================
-- 3. EXECUTION HISTORY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS execution_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  code TEXT NOT NULL,
  language TEXT NOT NULL,
  stdin TEXT,
  stdout TEXT,
  stderr TEXT,
  status TEXT,
  execution_time_ms INTEGER,
  memory_kb INTEGER,
  executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for execution_history table
CREATE INDEX IF NOT EXISTS idx_execution_history_user_id ON execution_history(user_id);
CREATE INDEX IF NOT EXISTS idx_execution_history_project_id ON execution_history(project_id);
CREATE INDEX IF NOT EXISTS idx_execution_history_executed_at ON execution_history(executed_at DESC);

-- ============================================
-- 4. USER PREFERENCES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'dark',
  editor_font_size INTEGER DEFAULT 14,
  editor_theme TEXT DEFAULT 'vs-dark',
  auto_save BOOLEAN DEFAULT TRUE,
  auto_save_interval_seconds INTEGER DEFAULT 30,
  show_onboarding BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 5. SHARED PROJECTS TABLE (for public sharing)
-- ============================================
CREATE TABLE IF NOT EXISTS shared_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  share_token TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  view_count INTEGER DEFAULT 0,
  CONSTRAINT shared_projects_unique_project UNIQUE(project_id)
);

-- Index for shared projects
CREATE INDEX IF NOT EXISTS idx_shared_projects_share_token ON shared_projects(share_token);
CREATE INDEX IF NOT EXISTS idx_shared_projects_project_id ON shared_projects(project_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE execution_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_projects ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROJECTS POLICIES
-- ============================================

-- Users can view their own projects
CREATE POLICY "Users can view own projects"
  ON projects
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can view public projects
CREATE POLICY "Anyone can view public projects"
  ON projects
  FOR SELECT
  USING (is_public = TRUE);

-- Users can insert their own projects
CREATE POLICY "Users can create own projects"
  ON projects
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own projects
CREATE POLICY "Users can update own projects"
  ON projects
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own projects
CREATE POLICY "Users can delete own projects"
  ON projects
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- FILES POLICIES
-- ============================================

-- Users can view files from their own projects
CREATE POLICY "Users can view files from own projects"
  ON files
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = files.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Anyone can view files from public projects
CREATE POLICY "Anyone can view files from public projects"
  ON files
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = files.project_id
      AND projects.is_public = TRUE
    )
  );

-- Users can insert files to their own projects
CREATE POLICY "Users can create files in own projects"
  ON files
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = files.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Users can update files in their own projects
CREATE POLICY "Users can update files in own projects"
  ON files
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = files.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Users can delete files from their own projects
CREATE POLICY "Users can delete files from own projects"
  ON files
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = files.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- ============================================
-- EXECUTION HISTORY POLICIES
-- ============================================

-- Users can view their own execution history
CREATE POLICY "Users can view own execution history"
  ON execution_history
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own execution history
CREATE POLICY "Users can create own execution history"
  ON execution_history
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own execution history
CREATE POLICY "Users can delete own execution history"
  ON execution_history
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- USER PREFERENCES POLICIES
-- ============================================

-- Users can view their own preferences
CREATE POLICY "Users can view own preferences"
  ON user_preferences
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own preferences
CREATE POLICY "Users can create own preferences"
  ON user_preferences
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own preferences
CREATE POLICY "Users can update own preferences"
  ON user_preferences
  FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- SHARED PROJECTS POLICIES
-- ============================================

-- Users can view shared links they created
CREATE POLICY "Users can view own shared projects"
  ON shared_projects
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = shared_projects.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Anyone can view shared projects by token (handled in app logic)
-- We'll create a function for this

-- Users can create share links for their projects
CREATE POLICY "Users can create share links for own projects"
  ON shared_projects
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = shared_projects.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Users can delete share links for their projects
CREATE POLICY "Users can delete share links for own projects"
  ON shared_projects
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = shared_projects.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- ============================================
-- STORAGE BUCKET POLICIES (Run in Supabase Dashboard -> Storage)
-- ============================================

-- Create bucket (do this in Supabase Dashboard or via SQL)
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('user-projects', 'user-projects', false);

-- Storage policies for user-projects bucket:
/*
-- Users can upload to their own folder
CREATE POLICY "Users can upload to own folder"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'user-projects' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can read from their own folder
CREATE POLICY "Users can read own files"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'user-projects' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can update their own files
CREATE POLICY "Users can update own files"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'user-projects' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can delete their own files
CREATE POLICY "Users can delete own files"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'user-projects' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
*/

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_files_updated_at
  BEFORE UPDATE ON files
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to generate share token
CREATE OR REPLACE FUNCTION generate_share_token()
RETURNS TEXT AS $$
BEGIN
  RETURN encode(gen_random_bytes(16), 'base64');
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- SEED DATA (Optional - for testing)
-- ============================================

-- This would be run after a user signs up to create default preferences
-- Example for creating default preferences on user signup (use Supabase Auth trigger)
-- CREATE OR REPLACE FUNCTION public.handle_new_user()
-- RETURNS TRIGGER AS $$
-- BEGIN
--   INSERT INTO public.user_preferences (user_id)
--   VALUES (NEW.id);
--   RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql SECURITY DEFINER;

-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW
--   EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- SETUP COMPLETE
-- ============================================

-- To verify setup, run:
-- SELECT tablename FROM pg_tables WHERE schemaname = 'public';
-- SELECT * FROM pg_policies WHERE schemaname = 'public';
