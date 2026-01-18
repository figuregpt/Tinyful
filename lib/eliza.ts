// ElizaOS API client for Eliza Cloud
// Uses Railway backend as proxy to keep API key secure

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3002';

export interface ElizaMessage {
  role: 'user' | 'assistant';
  content: string;
  metadata?: {
    type?: 'text' | 'question' | 'plan';
    question?: Question;
    plan?: GeneratedPlan;
  };
}

export interface Question {
  id: string;
  prompt: string;
  options: QuestionOption[];
  allowMultiple?: boolean;
}

export interface QuestionOption {
  id: string;
  label: string;
  description?: string;
}

export interface GeneratedPlan {
  title: string;
  description: string;
  targetDate?: string;
  steps: GeneratedStep[];
}

export interface GeneratedStep {
  title: string;
  description: string;
  dueDate?: string;
  estimatedDuration?: string;
}

export interface ChatResponse {
  message: ElizaMessage;
  sessionId: string;
}

class ElizaClient {
  private apiUrl: string;

  constructor() {
    this.apiUrl = API_URL;
  }

  async sendMessage(
    sessionId: string,
    message: string,
    context?: Record<string, unknown>
  ): Promise<ChatResponse> {
    try {
      // Call Railway backend (proxy to Eliza Cloud)
      const response = await fetch(`${this.apiUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          sessionId: sessionId,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Parse the response to determine if it's a question, plan, or regular message
      const parsedMessage = this.parseResponse(data.content);

      return {
        message: parsedMessage,
        sessionId,
      };
    } catch (error) {
      console.error('API error:', error);
      throw error;
    }
  }

  private parseResponse(content: string): ElizaMessage {
    // Try to parse structured content (questions or plans)
    const metadata = this.extractMetadata(content);

    return {
      role: 'assistant',
      content: metadata.cleanContent || content,
      metadata,
    };
  }

  private extractMetadata(content: string): ElizaMessage['metadata'] & { cleanContent?: string } {
    // Try to extract JSON blocks from the content
    const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/);
    
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[1]);
        const cleanContent = content.replace(/```json\n?[\s\S]*?\n?```/g, '').trim();

        if (parsed.type === 'question') {
          return {
            type: 'question',
            question: parsed.data,
            cleanContent,
          };
        }

        if (parsed.type === 'plan') {
          return {
            type: 'plan',
            plan: parsed.data,
            cleanContent,
          };
        }
      } catch {
        // Not valid JSON, treat as regular text
      }
    }

    return { type: 'text' };
  }

  async createSession(userId: string): Promise<string> {
    // For now, we'll use the userId as the session ID
    // In production, you might want to create a unique session via the API
    return `session_${userId}_${Date.now()}`;
  }
}

export const elizaClient = new ElizaClient();

// Helper function to format user selection for questions
export function formatQuestionResponse(question: Question, selectedIds: string[]): string {
  const selectedOptions = question.options.filter(opt => selectedIds.includes(opt.id));
  const labels = selectedOptions.map(opt => opt.label).join(', ');
  return `For "${question.prompt}", I choose: ${labels}`;
}
