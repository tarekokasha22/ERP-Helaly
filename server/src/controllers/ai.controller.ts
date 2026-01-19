import { Request, Response } from 'express';
import { sendMessageToClaude, getAvailableModels, isAnthropicConfigured } from '../services/anthropic.service';

/**
 * @route POST /api/ai/chat
 * @desc Send a message to Claude AI
 * @access Private
 */
export const chatWithAI = async (req: Request, res: Response) => {
  try {
    if (!isAnthropicConfigured()) {
      return res.status(400).json({
        success: false,
        message: 'Anthropic API key is not configured. Please add ANTHROPIC_API_KEY to your .env file.'
      });
    }

    const { message, model, systemPrompt, maxTokens } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Message is required and must be a string'
      });
    }

    const response = await sendMessageToClaude(message, {
      model,
      systemPrompt,
      maxTokens: maxTokens || 1024
    });

    res.json({
      success: true,
      response,
      model: model || 'claude-3-5-sonnet-20241022'
    });
  } catch (error: any) {
    console.error('Error in AI chat:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get AI response'
    });
  }
};

/**
 * @route GET /api/ai/models
 * @desc Get available AI models
 * @access Private
 */
export const getModels = async (req: Request, res: Response) => {
  try {
    const models = getAvailableModels();
    res.json({
      success: true,
      models,
      configured: isAnthropicConfigured()
    });
  } catch (error: any) {
    console.error('Error getting models:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get available models'
    });
  }
};

/**
 * @route GET /api/ai/status
 * @desc Check if Anthropic API is configured
 * @access Private
 */
export const getAIStatus = async (req: Request, res: Response) => {
  try {
    const configured = isAnthropicConfigured();
    res.json({
      success: true,
      configured,
      message: configured 
        ? 'Anthropic API is configured and ready to use'
        : 'Anthropic API key is not configured. Please add ANTHROPIC_API_KEY to your .env file.'
    });
  } catch (error: any) {
    console.error('Error checking AI status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check AI status'
    });
  }
};
