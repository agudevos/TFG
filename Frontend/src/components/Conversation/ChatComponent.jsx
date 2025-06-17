import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

/**
 * Componente reutilizable para mostrar conversaciones de chat
 * @param {Array} messages - Array de mensajes de la conversación
 * @param {Function} onSendMessage - Función para enviar un nuevo mensaje
 * @param {Boolean} isLoading - Indica si se está procesando una respuesta
 */
const ChatComponent = ({ messages, onSendMessage, isLoading }) => {
  const [inputMessage, setInputMessage] = React.useState('');
  const messagesEndRef = useRef(null);

  // Auto-scroll al último mensaje
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputMessage.trim() && !isLoading) {
      onSendMessage(inputMessage);
      setInputMessage('');
    }
  };

  return (
    <div className="w-full bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
      <div className="bg-gradient-to-r from-cyan-500 to-cyan-600 px-6 py-4">
        <h3 className="text-lg font-bold text-white">Conversación</h3>
      </div>
      
      <div className="h-96 overflow-y-auto px-6 py-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <svg className="w-16 h-16 text-cyan-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
            </svg>
            <p className="text-gray-500 text-lg">Inicia la conversación para extraer información del servicio</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className="flex flex-col max-w-[80%]">
                  <div className={`px-4 py-3 rounded-2xl ${
                    msg.role === 'user' 
                      ? 'bg-cyan-500 text-white rounded-br-none' 
                      : 'bg-gray-200 text-gray-800 rounded-bl-none'
                  }`}>
                    <p className="text-sm">{msg.content}</p>
                  </div>
                  <span className={`text-xs mt-1 text-gray-500 ${msg.role === 'user' ? 'text-right' : ''}`}>
                    {msg.role === 'user' ? 'Tú' : 'Asistente'} • {msg.timestamp || 'Ahora'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {isLoading && (
          <div className="flex justify-start mt-4">
            <div className="flex flex-col max-w-[80%]">
              <div className="px-4 py-3 bg-gray-200 rounded-2xl rounded-bl-none">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: '600ms' }}></div>
                  <span className="text-sm text-gray-500 ml-2">Generando respuesta...</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <div className="px-6 py-4 border-t border-gray-100">
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          <div className="relative flex-grow">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Describe tu servicio..."
              className="w-full px-4 py-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-700"
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            disabled={!inputMessage.trim() || isLoading}
            className="p-3 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-white transition-colors duration-300 disabled:bg-cyan-300 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

ChatComponent.propTypes = {
  messages: PropTypes.arrayOf(
    PropTypes.shape({
      role: PropTypes.oneOf(['user', 'assistant']).isRequired,
      content: PropTypes.string.isRequired,
      timestamp: PropTypes.string
    })
  ).isRequired,
  onSendMessage: PropTypes.func.isRequired,
  isLoading: PropTypes.bool
};

ChatComponent.defaultProps = {
  messages: [],
  isLoading: false
};

export default ChatComponent;