import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import aiService from '../services/aiService';
import { useAuth } from '../contexts/AuthContext';

const AIChat: React.FC = () => {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [conversation, setConversation] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [selectedModel, setSelectedModel] = useState('claude-3-5-sonnet-20241022');

  // Check AI status
  const { data: status, isLoading: statusLoading } = useQuery(
    ['ai-status'],
    () => aiService.getStatus(),
    {
      retry: false,
      onError: (error: any) => {
        console.error('Error checking AI status:', error);
      }
    }
  );

  // Get available models
  const { data: modelsData } = useQuery(
    ['ai-models'],
    () => aiService.getModels(),
    {
      enabled: !!status?.configured,
      retry: false
    }
  );

  // Chat mutation
  const chatMutation = useMutation(
    (userMessage: string) => aiService.chat(userMessage, { model: selectedModel }),
    {
      onSuccess: (response) => {
        setConversation(prev => [
          ...prev,
          { role: 'assistant', content: response }
        ]);
        setMessage('');
      },
      onError: (error: any) => {
        toast.error(error.message || 'Failed to get AI response');
      }
    }
  );

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const userMessage = message.trim();
    setConversation(prev => [...prev, { role: 'user', content: userMessage }]);
    chatMutation.mutate(userMessage);
  };

  const handleClear = () => {
    setConversation([]);
  };

  if (statusLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading AI service...</p>
        </div>
      </div>
    );
  }

  if (!status?.configured) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-yellow-800 mb-2">⚠️ AI Service Not Configured</h2>
          <p className="text-yellow-700 mb-4">
            The Anthropic API key is not configured. Please add your API key to the server's .env file.
          </p>
          <div className="bg-gray-100 p-4 rounded mt-4">
            <p className="text-sm text-gray-700 font-mono">
              ANTHROPIC_API_KEY=your_api_key_here
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-t-lg">
          <h1 className="text-2xl font-bold mb-2">🤖 AI Assistant (Claude)</h1>
          <p className="text-blue-100">Ask me anything about your projects, reports, or get assistance!</p>
        </div>

        {/* Model Selection */}
        {modelsData?.models && (
          <div className="p-4 border-b bg-gray-50">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Model:
            </label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={chatMutation.isLoading}
            >
              {modelsData.models.map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Conversation */}
        <div className="h-96 overflow-y-auto p-6 space-y-4 bg-gray-50">
          {conversation.length === 0 ? (
            <div className="text-center text-gray-500 mt-20">
              <p className="text-lg mb-2">👋 Start a conversation!</p>
              <p className="text-sm">Try asking: "What are best practices for project management?"</p>
            </div>
          ) : (
            conversation.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-3xl rounded-lg p-4 ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-gray-200 text-gray-800'
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    <span className="font-semibold">
                      {msg.role === 'user' ? 'You' : '🤖 Claude'}
                    </span>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))
          )}
          {chatMutation.isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-gray-600">Thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSend} className="p-4 border-t bg-white rounded-b-lg">
          <div className="flex space-x-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={chatMutation.isLoading}
            />
            <button
              type="submit"
              disabled={chatMutation.isLoading || !message.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {chatMutation.isLoading ? 'Sending...' : 'Send'}
            </button>
            {conversation.length > 0 && (
              <button
                type="button"
                onClick={handleClear}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Info Section */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">💡 Tips:</h3>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Ask questions about project management, construction, or reports</li>
          <li>Request help with data analysis or insights</li>
          <li>Get suggestions for improving workflows</li>
          <li>Try different models for different use cases</li>
        </ul>
      </div>
    </div>
  );
};

export default AIChat;
