import React, { useState, useEffect } from 'react';
import ChatComponent from '../../components/Conversation/ChatComponent';
import ServiceItem from '../../components/Service/ServiceItem';
import { getFromApi, postToApi } from '../../utils/functions/api';

const CombinedServiceView = () => {
  // Estado para el servicio actual (chat)
  const [serviceData, setServiceData] = useState({
    message: '',
    date: '',
    start_time: '',
    end_time: '',
    category: '',
    price: '',
    finished: false
  });
  
  // Estado para la sesión actual
  const [sessionId, setSessionId] = useState('');
  
  // Estado para los mensajes del chat
  const [messages, setMessages] = useState([]);
  
  // Estado para indicar si está cargando la respuesta del chat
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  
  // Estado para almacenar la lista de servicios
  const [services, setServices] = useState([]);
  
  // Estado para controlar la carga de la lista
  const [isLoadingList, setIsLoadingList] = useState(true);
  
  // Estado para manejar errores de la lista
  const [error, setError] = useState(null);

  // Iniciar una nueva sesión cuando el componente se monta y cargar la lista de servicios
  useEffect(() => {
    startNewSession();
  }, []);
  
  // Función para iniciar una nueva sesión de chat
  const startNewSession = async () => {
    try {
      setIsLoadingChat(true);
      const response = await postToApi('conversations/service/', {
        message: ',' // Mensaje vacío para iniciar sesión
      });
      
      // Asegurarse de que tenemos datos válidos antes de actualizar el estado
      if (response) {
        setServiceData(response);
        setSessionId(response.session_id);
        
        // Agregar el mensaje inicial al chat
        setMessages([
          {
            role: 'assistant',
            content: response.message,
            timestamp: new Date().toLocaleTimeString()
          }
        ]);
      }
      setIsLoadingChat(false);
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      setIsLoadingChat(false);
    }
  };
  
  // Función para enviar un mensaje al chat
  const sendMessage = async (message) => {
    if (!message.trim()) return;
    
    // Agregar el mensaje del usuario al chat
    setMessages(prev => [
      ...prev,
      {
        role: 'user',
        content: message,
        timestamp: new Date().toLocaleTimeString()
      }
    ]);
    
    try {
      setIsLoadingChat(true);
      const response = await postToApi('conversations/service/', {
        message,
        session_id: sessionId
      });
      
      if (response) {
        // Agregar la respuesta del asistente al chat
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: response.message,
            timestamp: new Date().toLocaleTimeString()
          }
        ]);
        
        setServiceData(response);
      }
      setIsLoadingChat(false);
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      setIsLoadingChat(false);
      
      // Agregar mensaje de error
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Ha ocurrido un error al procesar tu mensaje. Por favor, intenta de nuevo.',
          timestamp: new Date().toLocaleTimeString()
        }
      ]);
    }
  };
  
  // Función para obtener la lista de servicios desde la API
  useEffect(() => {
    try {
      setIsLoadingList(true);
      const filters = {
        date: serviceData.date,
        start_time: serviceData.start_time,
        end_time: serviceData.end_time,
        price: serviceData.price,
        category: serviceData.category
      } 
      console.log(filters)
      const params = new URLSearchParams();
  
      // Añadir cada parámetro no vacío
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value);
        }
      });
      getFromApi(`services/recomendations/?${params.toString()}`)
        .then((response) => response.json())
        .then((data) => {
          setServices(data)});
      setIsLoadingList(false);
    } catch (err) {
      console.error('Error al cargar los servicios:', err);
      setError('No se pudieron cargar los servicios. Por favor, intenta de nuevo más tarde.');
      setIsLoadingList(false);
    }
  }, [serviceData]);
  
  // Función para reiniciar la sesión de chat
  const resetSession = () => {
    if (window.confirm('¿Estás seguro de que deseas iniciar una nueva conversación? Se perderán los datos actuales.')) {
      setMessages([]);
      startNewSession();
    }
  };
  
  // Función para manejar el clic en un servicio
  const handleServiceClick = (service) => {
    console.log('Servicio seleccionado:', service);
    // Aquí podrías navegar a una vista detallada o mostrar un modal
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-500 to-cyan-600">
          Recomendación de Servicios con IA
        </span>
      </h1>
      
      {/* Sección del chat */}
      <div className="mb-16">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-white flex items-center">
            <svg className="w-6 h-6 mr-2 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
            </svg>
            Crear Servicio por Chat
          </h2>
          <button 
            onClick={resetSession}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-300 flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            Nueva Conversación
          </button>
        </div>
        
        {/* Componente de Chat */}
        <ChatComponent 
          messages={messages}
          onSendMessage={sendMessage}
          isLoading={isLoadingChat}
        />
        
      </div>
      
      {/* Lista de servicios */}
      <div>
        <h2 className="text-2xl font-semibold mb-6 text-white flex items-center">
          <svg className="w-6 h-6 mr-2 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
          </svg>
          Servicios Disponibles
        </h2>

        {isLoadingList ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        ) : services && services.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
            </svg>
            <h3 className="text-lg font-medium text-gray-900">No hay servicios disponibles</h3>
            {messages.length === 1 ? ( 
              <p className="mt-2 text-gray-500"> Empieza una conversación para obtener recomendaciones</p> 
                ) : (
                  <p className="mt-2 text-gray-500">No hay servicios que cumplan tus condiciones.</p>)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services && services.map((service) => (
              <ServiceItem 
                key={service.id}
                service={service}
                onClick={handleServiceClick}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};


export default CombinedServiceView;