import { useState, useRef, useEffect, useCallback } from 'react';
import {
  MessageCircle, X, Send, Minus, User, Bot,
  Sparkles, Plus, Edit2, Trash2, Check,
  MoreVertical, Phone, Video, Paperclip, Image
} from 'lucide-react';
import { socketService } from '../../services/socket';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [isAgentAvailable, setIsAgentAvailable] = useState(true);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingContent, setEditingContent] = useState('');
  const [showMenuForMessage, setShowMenuForMessage] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, isOpen]);

  // Focus input when opening
  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  // Connect to socket and listen for messages
  useEffect(() => {
    if (isOpen) {
      const socket = socketService.connect();

      // Join chat room
      if (conversationId) {
        socket.emit('join-chat', conversationId);
      }

      // Listen for new messages
      socket.on('new-message', (message) => {
        setMessages(prev => [...prev, message]);
        setIsTyping(false);
      });

      // Listen for typing indicators
      socket.on('agent-typing', () => {
        setIsTyping(true);
      });

      socket.on('agent-stop-typing', () => {
        setIsTyping(false);
      });

      return () => {
        socket.off('new-message');
        socket.off('agent-typing');
        socket.off('agent-stop-typing');
      };
    }
  }, [isOpen, conversationId]);

  // Welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: 'welcome',
        content: '¡Hola! 👋 Bienvenido a BORIS. Soy tu asistente virtual. ¿En qué puedo ayudarte hoy? También puedes solicitar hablar con un agente en tiempo real.',
        sender_type: 'bot',
        created_at: new Date().toISOString(),
      }]);
    }
  }, []);

  const handleSend = useCallback(() => {
    if (inputValue.trim() && conversationId) {
      const message = {
        id: Date.now().toString(),
        conversation_id: conversationId,
        content: inputValue.trim(),
        sender_type: 'user',
        message_type: 'text',
        created_at: new Date().toISOString(),
      };

      // Add to local messages
      setMessages(prev => [...prev, message]);

      // Send via socket
      socketService.socket?.emit('chat-message', {
        conversationId,
        message,
      });

      setInputValue('');

      // Simulate agent typing response
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const responses = [
          'Gracias por tu mensaje. Un agente te atenderá en breve.',
          'He registrado tu consulta. Enseguida un asesor te contactará.',
          'Perfecto. Un miembro de nuestro equipo te escribirá pronto.',
        ];
        const botResponse = {
          id: (Date.now() + 1).toString(),
          conversation_id: conversationId,
          content: responses[Math.floor(Math.random() * responses.length)],
          sender_type: 'agent',
          created_at: new Date().toISOString(),
        };
        setMessages(prev => [...prev, botResponse]);
      }, 2000);
    }
  }, [inputValue, conversationId]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleStartEdit = (messageId, content) => {
    setEditingMessageId(messageId);
    setEditingContent(content);
    setShowMenuForMessage(null);
  };

  const handleSaveEdit = () => {
    if (editingMessageId && editingContent.trim()) {
      setMessages(prev =>
        prev.map(msg =>
          msg.id === editingMessageId
            ? { ...msg, content: editingContent.trim(), edited: true }
            : msg
        )
      );
      setEditingMessageId(null);
      setEditingContent('');
    }
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditingContent('');
  };

  const handleDeleteMessage = (messageId) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
    setShowMenuForMessage(null);
  };

  const handleStartChatWithAgent = () => {
    const newConversationId = `chat-${Date.now()}`;
    setConversationId(newConversationId);

    // Add system message
    const systemMessage = {
      id: Date.now().toString(),
      content: 'Conectando con un agente... Por favor espera un momento.',
      sender_type: 'system',
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, systemMessage]);

    // Simulate agent connection
    setTimeout(() => {
      setIsAgentAvailable(true);
      const agentMessage = {
        id: (Date.now() + 1).toString(),
        content: '¡Hola! Soy un agente de BORIS. ¿En qué puedo ayudarte hoy?',
        sender_type: 'agent',
        agent_name: 'Carlos - Asesor BORIS',
        created_at: new Date().toISOString(),
      };
      setMessages(prev => [...prev, agentMessage]);
    }, 1500);
  };

  const handleStartNewConversation = () => {
    setMessages([{
      id: 'welcome',
      content: '¡Hola! 👋 Bienvenido a BORIS. Soy tu asistente virtual. ¿En qué puedo ayudarte hoy? También puedes solicitar hablar con un agente en tiempo real.',
      sender_type: 'bot',
      created_at: new Date().toISOString(),
    }]);
    setConversationId(null);
    setIsAgentAvailable(false);
  };

  const quickReplies = [
    { id: '1', text: '📦 Ver menú', payload: 'menu' },
    { id: '2', text: '📍 Ver ubicación', payload: 'location' },
    { id: '3', text: '🕐 Horarios', payload: 'hours' },
    { id: '4', text: '💬 Hablar con agente', payload: 'agent', action: handleStartChatWithAgent },
    { id: '5', text: '📅 Hacer reserva', payload: 'reservation' },
  ];

  const handleQuickReply = (reply) => {
    if (reply.action) {
      reply.action();
      return;
    }

    const userMessage = {
      id: Date.now().toString(),
      conversation_id: conversationId,
      content: reply.text,
      sender_type: 'user',
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMessage]);

    // Simulate response
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const responses = {
        menu: 'Nuestro menú incluye: Ceviches ($38.000-$48.000), Mariscos ($42.000-$125.000), Langosta ($125.000), Pescados ($58.000-$75.000) y Arroces ($48.000-$65.000). ¿Te gustaría ver el menú completo?',
        location: 'Nos encontramos en: Calle del Arsenal #10-43, Centro Histórico, Cartagena. ¡Te esperamos!',
        hours: 'Nuestro horario es: Lunes a Domingo 11:00 AM - 10:00 PM. Viernes y Sábado hasta 11:00 PM.',
        reservation: 'Para hacer una reserva, puedes usar el botón "Reservar" en nuestra página o llamarnos al +57 300 123 4567.',
      };
      const botResponse = {
        id: (Date.now() + 1).toString(),
        conversation_id: conversationId,
        content: responses[reply.payload] || 'Gracias por tu mensaje. ¿Hay algo más en que pueda ayudarte?',
        sender_type: 'bot',
        created_at: new Date().toISOString(),
      };
      setMessages(prev => [...prev, botResponse]);
    }, 1500);
  };

  return (
    <>
      {/* Chat button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 p-4 bg-ocean-600 text-white rounded-full shadow-lg hover:bg-ocean-700 transition-colors animate-pulse"
          aria-label="Abrir chat"
        >
          <MessageCircle className="h-6 w-6" />
          {/* Online indicator */}
          <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-400 rounded-full border-2 border-white" />
        </button>
      )}

      {/* Chat window */}
      {isOpen && (
        <div
          className={`fixed bottom-6 right-6 z-50 w-96 bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-all duration-300 ${
            isMinimized ? 'h-auto' : 'h-[600px]'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-ocean-600 text-white">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  {isAgentAvailable ? (
                    <User className="h-5 w-5" />
                  ) : (
                    <Bot className="h-5 w-5" />
                  )}
                </div>
                <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-400 rounded-full border-2 border-ocean-600" />
              </div>
              <div>
                <h3 className="font-semibold">
                  {isAgentAvailable ? 'Agente BORIS' : 'Asistente BORIS'}
                </h3>
                <p className="text-xs text-ocean-200">
                  {isAgentAvailable ? 'En línea - Responde en minutos' : 'En línea - Listo para ayudarte'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleStartNewConversation}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                title="Nueva conversación"
              >
                <Plus className="h-4 w-4" />
              </button>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                title={isMinimized ? "Maximizar" : "Minimizar"}
              >
                <Minus className="h-4 w-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                title="Cerrar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          {!isMinimized && (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.map((message, index) => (
                  <div
                    key={message.id || index}
                    className={`flex gap-3 group relative ${
                      message.sender_type === 'user' ? 'flex-row-reverse' : ''
                    }`}
                  >
                    {/* Avatar */}
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        message.sender_type === 'user'
                          ? 'bg-ocean-600 text-white'
                          : message.sender_type === 'system'
                          ? 'bg-gray-400 text-white'
                          : 'bg-ocean-100 text-ocean-600'
                      }`}
                    >
                      {message.sender_type === 'user' ? (
                        <User className="h-4 w-4" />
                      ) : message.sender_type === 'system' ? (
                        <Sparkles className="h-4 w-4" />
                      ) : (
                        <Bot className="h-4 w-4" />
                      )}
                    </div>

                    {/* Message bubble */}
                    <div className={`max-w-[75%] relative ${
                      message.sender_type === 'user' ? 'flex flex-col items-end' : ''
                    }`}>
                      {message.sender_type === 'agent' && (
                        <p className="text-xs text-gray-500 mb-1">{message.agent_name}</p>
                      )}

                      {editingMessageId === message.id ? (
                        <div className="bg-white rounded-2xl px-4 py-3 rounded-tr-sm border">
                          <input
                            type="text"
                            value={editingContent}
                            onChange={(e) => setEditingContent(e.target.value)}
                            className="w-full text-sm text-gray-900 bg-transparent outline-none"
                            autoFocus
                          />
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={handleSaveEdit}
                              className="p-1 text-green-600 hover:bg-green-100 rounded"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="p-1 text-red-600 hover:bg-red-100 rounded"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div
                          className={`rounded-2xl px-4 py-3 ${
                            message.sender_type === 'user'
                              ? 'bg-ocean-600 text-white rounded-tr-sm'
                              : message.sender_type === 'system'
                              ? 'bg-gray-200 text-gray-600 text-center text-sm'
                              : 'bg-white text-gray-900 rounded-tl-sm shadow-sm'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          {message.edited && (
                            <span className="text-xs opacity-60">(editado)</span>
                          )}
                        </div>
                      )}

                      {/* Edit/Delete menu for user messages */}
                      {message.sender_type === 'user' && message.id !== 'welcome' && !editingMessageId && (
                        <div className="absolute -left-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setShowMenuForMessage(showMenuForMessage === message.id ? null : message.id)}
                            className="p-1 text-gray-400 hover:text-gray-600 rounded"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>

                          {showMenuForMessage === message.id && (
                            <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border overflow-hidden z-10">
                              <button
                                onClick={() => handleStartEdit(message.id, message.content)}
                                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
                              >
                                <Edit2 className="h-3 w-3" />
                                Editar
                              </button>
                              <button
                                onClick={() => handleDeleteMessage(message.id)}
                                className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-gray-100 w-full"
                              >
                                <Trash2 className="h-3 w-3" />
                                Eliminar
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Typing indicator */}
                {isTyping && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-ocean-100 rounded-full flex items-center justify-center">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick replies */}
              {messages.length <= 2 && (
                <div className="px-4 pb-2 bg-gray-50 border-t">
                  <p className="text-xs text-gray-400 mb-2">Respuestas rápidas:</p>
                  <div className="flex flex-wrap gap-2">
                    {quickReplies.map((reply) => (
                      <button
                        key={reply.id}
                        onClick={() => handleQuickReply(reply)}
                        className="px-3 py-1.5 bg-ocean-100 text-ocean-700 text-sm rounded-full hover:bg-ocean-200 transition-colors"
                      >
                        {reply.text}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input */}
              <div className="p-4 border-t bg-white">
                <div className="flex items-center gap-2">
                  <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                    <Paperclip className="h-5 w-5" />
                  </button>
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Escribe un mensaje..."
                    className="flex-1 h-11 px-4 bg-gray-100 border border-gray-200 rounded-full text-gray-900 placeholder-gray-400 focus:outline-none focus:border-ocean-400 transition-colors"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!inputValue.trim()}
                    className="h-11 w-11 bg-ocean-600 text-white rounded-full flex items-center justify-center hover:bg-ocean-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default ChatWidget;
