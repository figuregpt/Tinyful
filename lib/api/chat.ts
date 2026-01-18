import { supabase } from '../supabase';
import { ChatSession, Message } from '../database.types';

export async function createChatSession(
  userId: string,
  planId?: string
): Promise<ChatSession> {
  const sessionData = {
    user_id: userId,
    plan_id: planId || null,
  };
  
  const { data, error } = await supabase
    .from('chat_sessions')
    .insert(sessionData)
    .select()
    .single();

  if (error) throw error;
  return data as ChatSession;
}

export async function getChatSession(sessionId: string): Promise<ChatSession | null> {
  const { data, error } = await supabase
    .from('chat_sessions')
    .select('*')
    .eq('id', sessionId)
    .single();

  if (error) throw error;
  return data;
}

export async function getSessionMessages(sessionId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function saveMessage(
  sessionId: string,
  role: 'user' | 'assistant',
  content: string,
  metadata?: Record<string, unknown>
): Promise<Message> {
  const messageData = {
    session_id: sessionId,
    role,
    content,
    metadata: metadata || null,
  };
  
  const { data, error } = await supabase
    .from('messages')
    .insert(messageData)
    .select()
    .single();

  if (error) throw error;
  return data as Message;
}

export async function updateSessionPlan(
  sessionId: string,
  planId: string
): Promise<void> {
  const updateData = { plan_id: planId };
  const { error } = await supabase
    .from('chat_sessions')
    .update(updateData)
    .eq('id', sessionId);

  if (error) throw error;
}

export async function getUserChatSessions(userId: string): Promise<ChatSession[]> {
  const { data, error } = await supabase
    .from('chat_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function deleteChatSession(sessionId: string): Promise<void> {
  // First delete all messages in this session
  const { error: messagesError } = await supabase
    .from('messages')
    .delete()
    .eq('session_id', sessionId);

  if (messagesError) throw messagesError;

  // Then delete the session itself
  const { error: sessionError } = await supabase
    .from('chat_sessions')
    .delete()
    .eq('id', sessionId);

  if (sessionError) throw sessionError;
}
