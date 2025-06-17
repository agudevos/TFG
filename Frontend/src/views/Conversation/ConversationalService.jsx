import React, { useState, useEffect, useContext } from 'react';
import ChatComponent from '../../components/Conversation/ChatComponent';
import { postToApi } from '../../utils/functions/api';
import { Button } from '@radix-ui/themes';
import EstablishmentContext from "../../utils/context/EstablishmentContext";

const ConversationalService = () => {
  const {selectedEstablishment } = useContext(EstablishmentContext);
  // Estado para el servicio actual (inicializado con valores por defecto)
  const [serviceData, setServiceData] = useState({
    message: '',
    name: '',
    description: '',
    category: '',
    max_reservation: '',
    deposit: '',
    finished: false
  });
  
  // Estado para la sesión actual
  const [sessionId, setSessionId] = useState('');
  
  // Estado para los mensajes del chat
  const [messages, setMessages] = useState([]);
  
  // Estado para indicar si está cargando
  const [isLoading, setIsLoading] = useState(false);
  
  // Iniciar una nueva sesión cuando el componente se monta
  useEffect(() => {
    startNewSession();
  }, []);
  
  // Función para iniciar una nueva sesión
  const startNewSession = async () => {
    try {
      setIsLoading(true);
      const response = await postToApi('conversations/service/', {
        message: ','
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
      setIsLoading(false);
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      setIsLoading(false);
    }
  };
  
  // Función para enviar un mensaje
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
      setIsLoading(true);
      const response = await postToApi('conversations/service/', {
        message,
        session_id: sessionId
      });
      
      if (response) {
        setServiceData(response);
        
        // Agregar la respuesta del asistente al chat
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: response.message,
            timestamp: new Date().toLocaleTimeString()
          }
        ]);
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      setIsLoading(false);
      
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

  const handleServiceSubmit = async (e) => {  
    try {
      const response = await postToApi("services/create/", {
        name: serviceData.name,
        description: serviceData.description,
        category: serviceData.category,
        max_reservation: parseInt(serviceData.max_reservation),
        deposit: parseInt(serviceData.deposit),
        establishment: selectedEstablishment.id
      });
  
      console.log("Servicio agregado exitosamente", response);
    } catch(error) {
      console.error("Error en el submit:", error.message);
    }
  }

  
  // Función para reiniciar la sesión
  const resetSession = () => {
    if (window.confirm('¿Estás seguro de que deseas iniciar una nueva conversación? Se perderán los datos actuales.')) {
      setMessages([]);
      startNewSession();
    }
  };
  
  // Determinar el estado de cada campo - CORREGIDO PARA MANEJAR VALORES UNDEFINED
  const getFieldStatus = (field) => {
    // Verificar que serviceData existe y tiene la propiedad antes de acceder a ella
    if (!serviceData || serviceData[field] === "") return 'empty';
    return 'filled';
  };
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-500 to-cyan-600">
          Extractor de Servicios
        </span>
      </h1>
      
      {/* Panel de información del servicio */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">Información del Servicio</h2>
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
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Primera columna */}
          <div className="space-y-4">
            {/* Nombre */}
            <div className={`transition-all duration-300 rounded-lg overflow-hidden ${
              getFieldStatus('name') === 'filled' 
                ? 'shadow-sm border-l-4 border-cyan-500' 
                : 'shadow-sm border-l-4 border-gray-200'
            }`}>
              <div className="px-4 py-2 bg-gray-50 flex justify-between items-center">
                <h3 className="font-medium text-gray-700">Nombre</h3>
                {getFieldStatus('name') === 'filled' ? (
                  <span className="text-xs bg-cyan-100 text-cyan-800 px-2 py-1 rounded-full">Completado</span>
                ) : (
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">Pendiente</span>
                )}
              </div>
              <div className="p-4 bg-white">
                {serviceData && serviceData.name ? (
                  <p className="text-gray-800">{serviceData.name}</p>
                ) : (
                  <p className="text-gray-400 italic">Pendiente de información</p>
                )}
              </div>
            </div>
            
            {/* Descripción */}
            <div className={`transition-all duration-300 rounded-lg overflow-hidden ${
              getFieldStatus('description') === 'filled' 
                ? 'shadow-sm border-l-4 border-cyan-500' 
                : 'shadow-sm border-l-4 border-gray-200'
            }`}>
              <div className="px-4 py-2 bg-gray-50 flex justify-between items-center">
                <h3 className="font-medium text-gray-700">Descripción</h3>
                {getFieldStatus('description') === 'filled' ? (
                  <span className="text-xs bg-cyan-100 text-cyan-800 px-2 py-1 rounded-full">Completado</span>
                ) : (
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">Pendiente</span>
                )}
              </div>
              <div className="p-4 bg-white">
                {serviceData && serviceData.description ? (
                  <p className="text-gray-800">{serviceData.description}</p>
                ) : (
                  <p className="text-gray-400 italic">Pendiente de información</p>
                )}
              </div>
            </div>
            
            {/* Categoría */}
            <div className={`transition-all duration-300 rounded-lg overflow-hidden ${
              getFieldStatus('category') === 'filled' 
                ? 'shadow-sm border-l-4 border-cyan-500' 
                : 'shadow-sm border-l-4 border-gray-200'
            }`}>
              <div className="px-4 py-2 bg-gray-50 flex justify-between items-center">
                <h3 className="font-medium text-gray-700">Categoría</h3>
                {getFieldStatus('category') === 'filled' ? (
                  <span className="text-xs bg-cyan-100 text-cyan-800 px-2 py-1 rounded-full">Completado</span>
                ) : (
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">Pendiente</span>
                )}
              </div>
              <div className="p-4 bg-white">
                {serviceData && serviceData.category ? (
                  <p className="text-gray-800">{serviceData.category}</p>
                ) : (
                  <p className="text-gray-400 italic">Pendiente de información</p>
                )}
              </div>
            </div>
          </div>
          
          {/* Segunda columna */}
          <div className="space-y-4">
            {/* Tiempo Máximo */}
            <div className={`transition-all duration-300 rounded-lg overflow-hidden ${
              getFieldStatus('max_reservation') === 'filled' 
                ? 'shadow-sm border-l-4 border-cyan-500' 
                : 'shadow-sm border-l-4 border-gray-200'
            }`}>
              <div className="px-4 py-2 bg-gray-50 flex justify-between items-center">
                <h3 className="font-medium text-gray-700">Tiempo Máximo</h3>
                {getFieldStatus('max_reservation') === 'filled' ? (
                  <span className="text-xs bg-cyan-100 text-cyan-800 px-2 py-1 rounded-full">Completado</span>
                ) : (
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">Pendiente</span>
                )}
              </div>
              <div className="p-4 bg-white">
                {serviceData && serviceData.max_reservation ? (
                  <p className="text-gray-800">{serviceData.max_reservation}</p>
                ) : (
                  <p className="text-gray-400 italic">Pendiente de información</p>
                )}
              </div>
            </div>
            
            {/* Fianza */}
            <div className={`transition-all duration-300 rounded-lg overflow-hidden ${
              getFieldStatus('deposit') === 'filled' 
                ? 'shadow-sm border-l-4 border-cyan-500' 
                : 'shadow-sm border-l-4 border-gray-200'
            }`}>
              <div className="px-4 py-2 bg-gray-50 flex justify-between items-center">
                <h3 className="font-medium text-gray-700">Fianza</h3>
                {getFieldStatus('deposit') === 'filled' ? (
                  <span className="text-xs bg-cyan-100 text-cyan-800 px-2 py-1 rounded-full">Completado</span>
                ) : (
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">Pendiente</span>
                )}
              </div>
              <div className="p-4 bg-white">
                {serviceData && serviceData.deposit ? (
                  <p className="text-gray-800">{serviceData.deposit}</p>
                ) : (
                  <p className="text-gray-400 italic">Pendiente de información</p>
                )}
              </div>
            </div>
            
            {/* Estado */}
            <div className="rounded-lg overflow-hidden shadow-sm">
              <div className="px-4 py-2 bg-gray-50">
                <h3 className="font-medium text-gray-700">Estado general</h3>
              </div>
              <div className="p-4 bg-white">
                <div className={`p-3 rounded-lg ${
                  serviceData && serviceData.finished 
                    ? 'bg-green-50 border border-green-100 text-green-700' 
                    : 'bg-amber-50 border border-amber-100 text-amber-700'
                }`}>
                  <div className="flex items-center">
                    {serviceData && serviceData.finished ? (
                      <>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        <span>Información completa</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                        </svg>
                        <span>Recopilando información...</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Barra de progreso */}
        <div className="mt-6 px-2">
          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-cyan-400 to-cyan-500 rounded-full transition-all duration-700 ease-in-out" 
              style={{ 
                width: `${calculateProgress(serviceData)}%` 
              }}
            ></div>
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>Progreso</span>
            <span>{calculateProgress(serviceData)}% completado</span>
          </div>
        </div>
      </div>
      <div>
      {serviceData && serviceData.finished ? (
            <div>
                <Button
                type="button"
                onClick={() => handleServiceSubmit()}
                className="px-4 py-2 bg-green-500 text-white hover:bg-green-600 focus:outline-none focus:ring-4 focus:ring-green-500/50 transition-all duration-300 ease-in-out rounded-md font-medium"
              >Crear nuevo servicio</Button>
            </div>
            ):(
            <div>
            </div>
        )}
      </div>
      {/* Componente de Chat */}
      <ChatComponent 
        messages={messages}
        onSendMessage={sendMessage}
        isLoading={isLoading}
      />
      
      {/* Mensaje de servicio completado */}
      {serviceData && serviceData.finished && (
        <div className="mt-6 p-5 bg-green-50 border border-green-100 rounded-xl shadow-sm">
          <div className="flex items-start">
            <div className="flex-shrink-0 mt-1">
              <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Extracción completada</h3>
              <div className="mt-2 text-sm text-green-700">
                <p>¡Hemos recopilado toda la información necesaria para tu servicio! Puedes continuar la conversación o iniciar una nueva para otro servicio.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Función para calcular el progreso de la recopilación de información
const calculateProgress = (data) => {
  // Verificar que data no sea undefined
  if (!data) return 0;
  
  const fields = ['name', 'description', 'category', 'max_reservation', 'deposit'];
  const completedFields = fields.filter(field => data[field]).length;
  return Math.round((completedFields / fields.length) * 100);
};

export default ConversationalService;