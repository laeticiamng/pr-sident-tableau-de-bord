-- Chat conversations table
CREATE TABLE hq.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Nouvelle conversation',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Chat messages table
CREATE TABLE hq.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES hq.conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_conversations_user_id ON hq.conversations(user_id);
CREATE INDEX idx_chat_messages_conversation_id ON hq.chat_messages(conversation_id);
CREATE INDEX idx_conversations_updated_at ON hq.conversations(updated_at DESC);

-- RPC: List conversations for current user
CREATE OR REPLACE FUNCTION public.get_hq_conversations(limit_count INTEGER DEFAULT 20)
RETURNS TABLE(
  id UUID,
  title TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  last_message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'hq'
AS $$
BEGIN
  IF NOT public.is_owner() THEN
    RAISE EXCEPTION 'Accès non autorisé';
  END IF;

  RETURN QUERY
  SELECT 
    c.id, c.title, c.created_at, c.updated_at,
    (SELECT cm.content FROM hq.chat_messages cm WHERE cm.conversation_id = c.id ORDER BY cm.created_at DESC LIMIT 1)
  FROM hq.conversations c
  WHERE c.user_id = auth.uid()
  ORDER BY c.updated_at DESC
  LIMIT limit_count;
END;
$$;

-- RPC: Get messages for a conversation
CREATE OR REPLACE FUNCTION public.get_hq_chat_messages(p_conversation_id UUID)
RETURNS TABLE(
  id UUID,
  role TEXT,
  content TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'hq'
AS $$
BEGIN
  IF NOT public.is_owner() THEN
    RAISE EXCEPTION 'Accès non autorisé';
  END IF;

  -- Verify conversation belongs to user
  IF NOT EXISTS (SELECT 1 FROM hq.conversations conv WHERE conv.id = p_conversation_id AND conv.user_id = auth.uid()) THEN
    RAISE EXCEPTION 'Conversation non trouvée';
  END IF;

  RETURN QUERY
  SELECT cm.id, cm.role, cm.content, cm.created_at
  FROM hq.chat_messages cm
  WHERE cm.conversation_id = p_conversation_id
  ORDER BY cm.created_at ASC;
END;
$$;

-- RPC: Create a new conversation
CREATE OR REPLACE FUNCTION public.create_hq_conversation(p_title TEXT DEFAULT 'Nouvelle conversation')
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'hq'
AS $$
DECLARE
  new_id UUID;
BEGIN
  IF NOT public.is_owner() THEN
    RAISE EXCEPTION 'Accès non autorisé';
  END IF;

  INSERT INTO hq.conversations (user_id, title)
  VALUES (auth.uid(), p_title)
  RETURNING id INTO new_id;

  RETURN new_id;
END;
$$;

-- RPC: Add a message to a conversation
CREATE OR REPLACE FUNCTION public.add_hq_chat_message(
  p_conversation_id UUID,
  p_role TEXT,
  p_content TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'hq'
AS $$
DECLARE
  new_id UUID;
BEGIN
  IF NOT public.is_owner() THEN
    RAISE EXCEPTION 'Accès non autorisé';
  END IF;

  -- Verify conversation belongs to user
  IF NOT EXISTS (SELECT 1 FROM hq.conversations conv WHERE conv.id = p_conversation_id AND conv.user_id = auth.uid()) THEN
    RAISE EXCEPTION 'Conversation non trouvée';
  END IF;

  INSERT INTO hq.chat_messages (conversation_id, role, content)
  VALUES (p_conversation_id, p_role, p_content)
  RETURNING id INTO new_id;

  -- Update conversation timestamp and auto-title from first user message
  UPDATE hq.conversations SET updated_at = now() WHERE id = p_conversation_id;

  -- Auto-title: use first 60 chars of first user message
  UPDATE hq.conversations 
  SET title = LEFT(p_content, 60)
  WHERE id = p_conversation_id 
    AND title = 'Nouvelle conversation' 
    AND p_role = 'user';

  RETURN new_id;
END;
$$;

-- RPC: Delete a conversation
CREATE OR REPLACE FUNCTION public.delete_hq_conversation(p_conversation_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'hq'
AS $$
BEGIN
  IF NOT public.is_owner() THEN
    RAISE EXCEPTION 'Accès non autorisé';
  END IF;

  DELETE FROM hq.conversations WHERE id = p_conversation_id AND user_id = auth.uid();
  RETURN FOUND;
END;
$$;