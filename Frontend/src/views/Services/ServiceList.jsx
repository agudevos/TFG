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

  // Estado para los filtros
  const [filters, setFilters] = useState({
    date: '',
    start_time: '',
    end_time: '',
    category: '',
    price: '',
    sortBy: 'price' // Por defecto ordenar por precio
  });

  // Estado para controlar si los filtros manuales están activos
  const [manualFiltersActive, setManualFiltersActive] = useState(false);

  // Categorías disponibles
  const categories = ['televisión', 'billar', 'futbolin', 'juego de mesa'];

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
        
        // Si el servicio está actualizando datos, desactivar los filtros manuales
        if (response.date || response.category || response.start_time || response.end_time) {
          setManualFiltersActive(false);
        }
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
    fetchServices();
  }, [serviceData, manualFiltersActive, filters]);
  
  const fetchServices = async () => {
    try {
      setIsLoadingList(true);
      
      // Determinar qué filtros usar (manuales o de conversación)
      const activeFilters = manualFiltersActive ? filters : {
        date: serviceData.date,
        start_time: serviceData.start_time,
        end_time: serviceData.end_time,
        category: serviceData.category,
        price: serviceData.price,
        sortBy: filters.sortBy // Siempre usamos la opción de ordenación seleccionada manualmente
      };
      
      console.log("Filtros activos:", activeFilters);
      
      const params = new URLSearchParams();
  
      // Añadir cada parámetro no vacío
      Object.entries(activeFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '' && key !== 'sortBy') {
          params.append(key, value);
        }
      });
      
      const response = await getFromApi(`services/recomendations/?${params.toString()}`);
      let data = await response.json();
      console.log(data)
      
      // Ordenar resultados si es necesario
      if (activeFilters.sortBy === 'price_asc') {
        data = data.sort((a, b) => (a.price || 0) - (b.price || 0));
      } else if (activeFilters.sortBy === 'price_desc') {
        data = data.sort((a, b) => (b.price || 0) - (a.price || 0));
      }
      
      setServices(data);
      setIsLoadingList(false);
    } catch (err) {
      console.error('Error al cargar los servicios:', err);
      setError('No se pudieron cargar los servicios. Por favor, intenta de nuevo más tarde.');
      setIsLoadingList(false);
    }
  };
  
  // Función para reiniciar la sesión de chat
  const resetSession = () => {
    if (window.confirm('¿Estás seguro de que deseas iniciar una nueva conversación? Se perderán los datos actuales.')) {
      setMessages([]);
      startNewSession();
      setManualFiltersActive(false);
      setFilters({
        date: '',
        start_time: '',
        end_time: '',
        category: '',
        price: '',
        sortBy: 'price'
      });
    }
  };
  
  // Función para manejar el clic en un servicio
  const handleServiceClick = (service) => {
    console.log('Servicio seleccionado:', service);
    // Aquí podrías navegar a una vista detallada o mostrar un modal
  };
  
  // Función para manejar cambios en los filtros
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Activar filtros manuales cuando el usuario cambia algo
    setManualFiltersActive(true);
  };
  
  // Función para limpiar todos los filtros
  const clearFilters = () => {
    setFilters({
      date: '',
      start_time: '',
      end_time: '',
      category: '',
      sortBy: 'price'
    });
    setManualFiltersActive(true); // Mantener activos los filtros manuales pero vacíos
  };
  
  // Función para volver a los filtros del chat
  const useAIFilters = () => {
    setManualFiltersActive(false);
  };

  // Obtener la fecha actual en formato YYYY-MM-DD para el valor mínimo del input date
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-500 to-cyan-600">
          Recomendación de Servicios con IA
        </span>
      </h1>
      
      {/* Sección del chat */}
      <div className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-white flex items-center">
            <svg className="w-6 h-6 mr-2 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
            </svg>
            Asistente de Búsqueda
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
      
      {/* Barra de filtros */}
      <div className="mb-8 bg-white rounded-xl shadow-md p-4">
        <div className="flex flex-col md:flex-row justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-800 mb-2 md:mb-0">Filtros de búsqueda</h3>
          <div className="flex space-x-2">
            <button 
              onClick={clearFilters}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors"
            >
              Limpiar filtros
            </button>
            {manualFiltersActive && (
              <button 
                onClick={useAIFilters}
                className="px-3 py-1 text-sm bg-cyan-500 hover:bg-cyan-600 text-white rounded transition-colors"
              >
                Usar recomendaciones AI
              </button>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Filtro de fecha */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Día</label>
            <input
              type="date"
              name="date"
              value={manualFiltersActive ? filters.date : serviceData.date || ''}
              onChange={handleFilterChange}
              min={today}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>
          
          {/* Filtro de hora inicio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hora inicio</label>
            <input
              type="time"
              name="start_time"
              value={manualFiltersActive ? filters.start_time : serviceData.start_time || ''}
              onChange={handleFilterChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>
          
          {/* Filtro de hora fin */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hora fin</label>
            <input
              type="time"
              name="end_time"
              value={manualFiltersActive ? filters.end_time : serviceData.end_time || ''}
              onChange={handleFilterChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>
          
          {/* Filtro de categoría */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
            <select
              name="category"
              value={manualFiltersActive ? filters.category : serviceData.category || ''}
              onChange={handleFilterChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            >
              <option value="">Todas las categorías</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          {/* Ordenar por precio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ordenar por</label>
            <select
              name="sortBy"
              value={filters.sortBy}
              onChange={handleFilterChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            >
              <option value="price">Relevancia</option>
              <option value="price_asc">Precio: más bajo primero</option>
              <option value="price_desc">Precio: más alto primero</option>
            </select>
          </div>
        </div>
        
        {/* Indicador de filtros activos */}
        <div className="mt-4 flex flex-wrap gap-2">
          {manualFiltersActive ? (
            <div className="text-xs text-cyan-600 bg-cyan-50 rounded-full px-2 py-1">
              Filtros manuales activos
            </div>
          ) : (
            <div className="text-xs text-green-600 bg-green-50 rounded-full px-2 py-1">
              Recomendaciones IA activas
            </div>
          )}
          
          {/* Mostrar filtros activos como etiquetas */}
          {(manualFiltersActive ? filters : serviceData).date && (
            <div className="text-xs text-gray-600 bg-gray-100 rounded-full px-2 py-1">
              Día: {(manualFiltersActive ? filters : serviceData).date}
            </div>
          )}
          {(manualFiltersActive ? filters : serviceData).start_time && (
            <div className="text-xs text-gray-600 bg-gray-100 rounded-full px-2 py-1">
              Desde: {(manualFiltersActive ? filters : serviceData).start_time}
            </div>
          )}
          {(manualFiltersActive ? filters : serviceData).end_time && (
            <div className="text-xs text-gray-600 bg-gray-100 rounded-full px-2 py-1">
              Hasta: {(manualFiltersActive ? filters : serviceData).end_time}
            </div>
          )}
          {(manualFiltersActive ? filters : serviceData).category && (
            <div className="text-xs text-gray-600 bg-gray-100 rounded-full px-2 py-1">
              Categoría: {(manualFiltersActive ? filters : serviceData).category}
            </div>
          )}
        </div>
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
              <p className="mt-2 text-gray-500">Empieza una conversación o selecciona filtros para obtener recomendaciones</p> 
            ) : (
              <p className="mt-2 text-gray-500">No hay servicios que cumplan los criterios seleccionados.</p>
            )}
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