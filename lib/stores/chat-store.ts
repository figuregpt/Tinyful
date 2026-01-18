import { create } from 'zustand';
import { elizaClient, ElizaMessage, Question, GeneratedPlan, formatQuestionResponse } from '../eliza';
import { createChatSession, saveMessage } from '../api/chat';

interface ChatState {
  messages: ElizaMessage[];
  sessionId: string | null;
  pendingUserId: string | null; // User ID waiting for first message
  isLoading: boolean;
  currentQuestion: Question | null;
  generatedPlan: GeneratedPlan | null;
  
  // Actions
  initializeSession: (userId: string) => void;
  sendMessage: (message: string, userId: string) => Promise<void>;
  answerQuestion: (questionId: string, selectedOptionIds: string[], userId: string) => Promise<void>;
  clearChat: () => void;
  clearGeneratedPlan: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  sessionId: null,
  pendingUserId: null,
  isLoading: false,
  currentQuestion: null,
  generatedPlan: null,

  initializeSession: (userId: string) => {
    // Don't create DB session yet - wait for first user message
    const localSessionId = `pending_${userId}_${Date.now()}`;
    
    set({ 
      sessionId: localSessionId, 
      pendingUserId: userId,
      messages: [], 
      currentQuestion: null, 
      generatedPlan: null 
    });
  },

  sendMessage: async (message: string, userId: string) => {
    let { sessionId, messages, pendingUserId } = get();
    if (!sessionId) return;

    // Add user message to chat
    const userMessage: ElizaMessage = {
      role: 'user',
      content: message,
      metadata: { type: 'text' },
    };
    
    set({ 
      messages: [...messages, userMessage], 
      isLoading: true,
      currentQuestion: null,
    });

    // If this is the first user message, create the DB session now
    if (sessionId.startsWith('pending_') && pendingUserId) {
      try {
        const session = await createChatSession(pendingUserId);
        sessionId = session.id;
        set({ sessionId: session.id, pendingUserId: null });
      } catch (error) {
        console.error('Error creating session:', error);
        // Keep using local session
      }
    }

    // Save user message to database
    if (!sessionId.startsWith('pending_') && !sessionId.startsWith('local_')) {
      saveMessage(sessionId, 'user', message, { type: 'text' }).catch(console.error);
    }

    try {
      const response = await elizaClient.sendMessage(sessionId, message);
      
      // Save assistant response to database
      if (!sessionId.startsWith('pending_') && !sessionId.startsWith('local_')) {
        saveMessage(
          sessionId, 
          'assistant', 
          response.message.content, 
          response.message.metadata
        ).catch(console.error);
      }
      
      const newState: Partial<ChatState> = {
        messages: [...get().messages, response.message],
        isLoading: false,
      };

      // Handle special response types
      if (response.message.metadata?.type === 'question') {
        newState.currentQuestion = response.message.metadata.question || null;
      } else if (response.message.metadata?.type === 'plan') {
        newState.generatedPlan = response.message.metadata.plan || null;
      }

      set(newState);
    } catch (error) {
      console.error('Chat error:', error);
      
      // Add error message
      const errorMessage: ElizaMessage = {
        role: 'assistant',
        content: "Oops! Something went wrong. Let's try that again!",
        metadata: { type: 'text' },
      };
      
      set({ 
        messages: [...get().messages, errorMessage], 
        isLoading: false,
      });
    }
  },

  answerQuestion: async (questionId: string, selectedOptionIds: string[], userId: string) => {
    const { currentQuestion } = get();
    if (!currentQuestion || currentQuestion.id !== questionId) return;

    const formattedResponse = formatQuestionResponse(currentQuestion, selectedOptionIds);
    await get().sendMessage(formattedResponse, userId);
  },

  clearChat: () => {
    set({ 
      messages: [], 
      sessionId: null, 
      currentQuestion: null,
      generatedPlan: null,
    });
  },

  clearGeneratedPlan: () => {
    set({ generatedPlan: null });
  },
}));
