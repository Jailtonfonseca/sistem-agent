/**
 * Chat Routes
 * API para chat com IA
 */

import express from 'express';
import aiService from '../services/ai.js';

const router = express.Router();

// Histórico de conversa em memória (em produção, usar banco de dados)
const conversationHistory = new Map();

// Enviar mensagem
router.post('/message', async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    
    if (!message) {
      return res.status(400).json({ success: false, error: 'Mensagem não fornecida' });
    }

    // Obter histórico da sessão
    const history = conversationHistory.get(sessionId) || [];
    
    // Tentar processar comando primeiro
    const commandResult = await aiService.processCommand(message);
    
    let response;
    if (commandResult) {
      response = commandResult.response;
    } else {
      // Usar IA para responder
      const aiResult = await aiService.chat(message, history);
      response = aiResult.response;
    }

    // Salvar no histórico
    history.push({ role: 'user', content: message });
    history.push({ role: 'assistant', content: response });
    
    // Manter apenas últimas 20 mensagens
    if (history.length > 20) {
      history.splice(0, history.length - 20);
    }
    conversationHistory.set(sessionId, history);

    res.json({ 
      success: true, 
      response,
      command: commandResult?.action || null
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Limpar histórico
router.delete('/history/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  conversationHistory.delete(sessionId);
  res.json({ success: true, message: 'Histórico limpo' });
});

// Obter histórico
router.get('/history/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const history = conversationHistory.get(sessionId) || [];
  res.json({ success: true, history });
});

// Sugestões de comandos
router.get('/suggestions', (req, res) => {
  const suggestions = [
    "Liste os containers em execução",
    "Qual o uso de CPU agora?",
    "Liste as imagens Docker",
    "Me mostre a memória",
    "Quais containers estão parados?",
    "Status do sistema",
    "Liste os volumes",
    "Qual o uso de disco?"
  ];
  
  res.json({ success: true, suggestions });
});

export default router;