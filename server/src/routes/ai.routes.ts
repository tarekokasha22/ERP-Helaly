import express from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { chatWithAI, getModels, getAIStatus } from '../controllers/ai.controller';

const router = express.Router();

/**
 * @route POST /api/ai/chat
 * @desc Send a message to Claude AI
 * @access Private
 * @body { message: string, model?: string, systemPrompt?: string, maxTokens?: number }
 */
router.post('/chat', authenticate, chatWithAI);

/**
 * @route GET /api/ai/models
 * @desc Get available AI models
 * @access Private
 */
router.get('/models', authenticate, getModels);

/**
 * @route GET /api/ai/status
 * @desc Check if Anthropic API is configured
 * @access Private
 */
router.get('/status', authenticate, getAIStatus);

export default router;
