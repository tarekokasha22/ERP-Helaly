import api from './api';

export interface ChatMessage {
  message: string;
  model?: string;
  systemPrompt?: string;
  maxTokens?: number;
}

export interface ChatResponse {
  success: boolean;
  response: string;
  model: string;
}

export interface AIStatus {
  success: boolean;
  configured: boolean;
  message: string;
}

export interface AIModels {
  success: boolean;
  models: string[];
  configured: boolean;
}

/**
 * AI Service for interacting with Anthropic Claude API
 */
export const aiService = {
  /**
   * Send a message to Claude AI
   * @param message - The user's message/prompt
   * @param options - Optional parameters (model, systemPrompt, maxTokens)
   * @returns The AI's response
   */
  async chat(message: string, options?: {
    model?: string;
    systemPrompt?: string;
    maxTokens?: number;
  }): Promise<string> {
    try {
      const response = await api.post<ChatResponse>('/ai/chat', {
        message,
        ...options
      });
      
      if (response.data.success) {
        return response.data.response;
      } else {
        throw new Error('Failed to get AI response');
      }
    } catch (error: any) {
      console.error('Error chatting with AI:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to communicate with AI service'
      );
    }
  },

  /**
   * Check if Anthropic API is configured
   * @returns Status information
   */
  async getStatus(): Promise<AIStatus> {
    try {
      const response = await api.get<AIStatus>('/ai/status');
      return response.data;
    } catch (error: any) {
      console.error('Error checking AI status:', error);
      throw error;
    }
  },

  /**
   * Get available AI models
   * @returns List of available models
   */
  async getModels(): Promise<AIModels> {
    try {
      const response = await api.get<AIModels>('/ai/models');
      return response.data;
    } catch (error: any) {
      console.error('Error getting AI models:', error);
      throw error;
    }
  }
};

export default aiService;
