-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgvector for RAG functionality (if needed later)
CREATE EXTENSION IF NOT EXISTS vector;

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  tier TEXT CHECK (tier IN ('basic', 'personalized', 'premium')) DEFAULT 'basic',
  stripe_customer_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Intake Responses table
CREATE TABLE IF NOT EXISTS public.intake_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  responses JSONB NOT NULL, -- Stores all intake question responses
  generated_path JSONB, -- AI-generated personalized learning path
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Video Progress table
CREATE TABLE IF NOT EXISTS public.video_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  video_id TEXT NOT NULL, -- Reference to video in syllabus
  section_id TEXT NOT NULL, -- Reference to section in syllabus
  completed BOOLEAN DEFAULT FALSE,
  last_position INTEGER DEFAULT 0, -- For resume watching (in seconds)
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, video_id)
);

-- Checkpoint Submissions table
CREATE TABLE IF NOT EXISTS public.checkpoint_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  checkpoint_id TEXT NOT NULL, -- Reference to checkpoint in syllabus
  section_id TEXT NOT NULL,
  submission TEXT, -- Text submission or description
  file_url TEXT, -- If file upload is involved
  validated BOOLEAN DEFAULT FALSE,
  feedback TEXT, -- AI or manual feedback
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  validated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments table
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL, -- Amount in cents
  currency TEXT DEFAULT 'USD',
  provider TEXT CHECK (provider = 'stripe') NOT NULL,
  provider_payment_id TEXT, -- External payment ID
  status TEXT CHECK (status IN ('pending', 'succeeded', 'failed', 'refunded')) DEFAULT 'pending',
  tier TEXT CHECK (tier IN ('basic', 'personalized', 'premium')),
  metadata JSONB, -- Additional payment metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_intake_responses_user_id ON public.intake_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_video_progress_user_id ON public.video_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_video_progress_video_id ON public.video_progress(video_id);
CREATE INDEX IF NOT EXISTS idx_checkpoint_submissions_user_id ON public.checkpoint_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intake_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkpoint_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for intake_responses
CREATE POLICY "Users can view own intake responses" ON public.intake_responses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own intake responses" ON public.intake_responses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own intake responses" ON public.intake_responses
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for video_progress
CREATE POLICY "Users can view own video progress" ON public.video_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own video progress" ON public.video_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own video progress" ON public.video_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for checkpoint_submissions
CREATE POLICY "Users can view own checkpoint submissions" ON public.checkpoint_submissions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own checkpoint submissions" ON public.checkpoint_submissions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own checkpoint submissions" ON public.checkpoint_submissions
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for payments
CREATE POLICY "Users can view own payments" ON public.payments
  FOR SELECT USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to automatically update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_intake_responses_updated_at BEFORE UPDATE ON public.intake_responses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_video_progress_updated_at BEFORE UPDATE ON public.video_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_checkpoint_submissions_updated_at BEFORE UPDATE ON public.checkpoint_submissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create user profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
