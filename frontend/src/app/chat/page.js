'use client';

import { useState, useEffect, useRef } from 'react';
import { FiSend, FiTrash2, FiCpu } from 'react-icons/fi';
import api from '@/services/api';

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const messagesEndRef = useRef(null);
  const sessionId = useRef(`session_${Date.now()}`);

  useEffect(() => {
    loadSuggestions();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  async function loadSuggestions() {
    try {
      const res = await api.getSuggestions();
      setSuggestions(res.suggestions || []);
    } catch (error) {
      console.error('Erro:', error);
    }
  }

  async function sendMessage(message = input) {
    if (!message.trim() || loading) return;

    const userMessage = { role: 'user', content: message };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.sendMessage(message, sessionId.current);
      
      if (res.success) {
        const aiMessage = { role: 'assistant', content: res.response };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: 'Desculpe, houve um erro ao processar sua mensagem.' 
        }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Erro de conexão. Tente novamente.' 
      }]);
    } finally {
      setLoading(false);
    }
  }

  async function clearChat() {
    setMessages([]);
    try {
      await api.clearHistory(sessionId.current);
    } catch (error) {
      console.error('Erro:', error);
    }
  }

  function handleKeyPress(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FiCpu className="text-indigo-500" />
            Chat com IA
          </h1>
          <p className="text-slate-400 mt-1">
            Gerencie seu servidor com comandos em linguagem natural
          </p>
        </div>
        <button
          onClick={clearChat}
          className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <FiTrash2 size={18} />
          Limpar Chat
        </button>
      </div>

      {/* Suggestions */}
      {messages.length === 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {suggestions.map((suggestion, i) => (
            <button
              key={i}
              onClick={() => sendMessage(suggestion)}
              className="bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded-full text-sm transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 bg-slate-800 rounded-xl border border-slate-700 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-slate-500 mt-8">
              <FiCpu size={48} className="mx-auto mb-4 opacity-50" />
              <p>Olá! Sou o assistente de IA do Sistem-Agent.</p>
              <p className="mt-2">Pergunte sobre seus containers, sistema ou execute comandos Docker.</p>
            </div>
          )}
          
          {messages.map((msg, i) => (
            <div 
              key={i} 
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[80%] p-4 rounded-xl ${
                  msg.role === 'user' 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-slate-700 text-slate-200'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-700 p-4 rounded-xl">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-slate-700">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Digite sua mensagem..."
              className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500"
              disabled={loading}
            />
            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-600 px-6 rounded-lg flex items-center gap-2"
            >
              <FiSend size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}