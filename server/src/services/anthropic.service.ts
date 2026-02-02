import Anthropic from '@anthropic-ai/sdk';
import { config } from '../config/config';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: config.anthropic.apiKey || process.env.ANTHROPIC_API_KEY || '',
});

/**
 * Send a message to Claude (Anthropic's AI model)
 * @param message - The user's message/prompt
 * @param model - The model to use (default: 'claude-3-5-sonnet-20241022')
 * @param systemPrompt - Optional system prompt to guide the model's behavior
 * @param maxTokens - Maximum tokens in the response (default: 1024)
 * @returns The AI's response text
 */
export async function sendMessageToClaude(
  message: string,
  options?: {
    model?: string;
    systemPrompt?: string;
    maxTokens?: number;
  }
): Promise<string> {
  try {
    if (!config.anthropic.apiKey && !process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY is not set. Please add it to your .env file.');
    }

    const {
      model = 'claude-3-5-sonnet-20241022',
      systemPrompt,
      maxTokens = 1024,
    } = options || {};

    const response = await anthropic.messages.create({
      model,
      max_tokens: maxTokens,
      messages: [
        {
          role: 'user',
          content: message,
        },
      ],
      ...(systemPrompt && { system: systemPrompt }),
    });

    // Extract text from response
    const textContent = response.content.find(
      (block) => block.type === 'text'
    ) as Anthropic.TextBlock | undefined;

    if (!textContent) {
      throw new Error('No text content in response');
    }

    return textContent.text;
  } catch (error: any) {
    console.error('Error calling Anthropic API:', error);
    throw new Error(
      `Failed to get response from Claude: ${error.message || 'Unknown error'}`
    );
  }
}

/**
 * Get available Claude models
 */
export function getAvailableModels(): string[] {
  return [
    'claude-3-5-sonnet-20241022',
    'claude-3-5-haiku-20241022',
    'claude-3-opus-20240229',
    'claude-3-sonnet-20240229',
    'claude-3-haiku-20240307',
  ];
}

/**
 * Check if Anthropic API is configured
 */
export function isAnthropicConfigured(): boolean {
  return !!(config.anthropic.apiKey || process.env.ANTHROPIC_API_KEY);
}
