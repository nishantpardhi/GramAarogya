import { Router } from 'express';
import { handleHealthChatbot, queryAiNavigator, queryAiAssistant } from '../controllers/aiController';
import { optionalAuth } from '../middleware/auth';

const router = Router();

// Modular AI Chatbot Routes with optional auth token inspection
router.post('/chat', optionalAuth, handleHealthChatbot);
router.post('/health-assistant', optionalAuth, handleHealthChatbot);
router.post('/navigator', optionalAuth, queryAiNavigator);
router.post('/assistant', optionalAuth, queryAiAssistant);

export default router;
