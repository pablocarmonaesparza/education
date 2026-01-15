-- Tutor Conversations table
CREATE TABLE IF NOT EXISTS public.tutor_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT DEFAULT 'Nueva conversación',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tutor Messages table
CREATE TABLE IF NOT EXISTS public.tutor_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES public.tutor_conversations(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('user', 'assistant')) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tutor_conversations_user_id ON public.tutor_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_tutor_messages_conversation_id ON public.tutor_messages(conversation_id);

-- Enable RLS
ALTER TABLE public.tutor_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutor_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tutor_conversations
CREATE POLICY "Users can view own conversations" ON public.tutor_conversations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conversations" ON public.tutor_conversations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations" ON public.tutor_conversations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversations" ON public.tutor_conversations
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for tutor_messages
CREATE POLICY "Users can view own messages" ON public.tutor_messages
  FOR SELECT USING (
    conversation_id IN (
      SELECT id FROM public.tutor_conversations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own messages" ON public.tutor_messages
  FOR INSERT WITH CHECK (
    conversation_id IN (
      SELECT id FROM public.tutor_conversations WHERE user_id = auth.uid()
    )
  );

-- Trigger for updated_at
CREATE TRIGGER update_tutor_conversations_updated_at 
  BEFORE UPDATE ON public.tutor_conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
