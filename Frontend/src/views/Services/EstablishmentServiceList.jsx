import React, { useState, useEffect, useContext } from 'react';
import SimpleServiceItem from '../../components/Service/SimpleServiceItem';
import { getFromApi } from '../../utils/functions/api';
import AuthContext from "../../utils/context/AuthContext";
import EstablishmentContext from '../../utils/context/EstablishmentContext';
import { useNavigate } from 'react-router';

const EstablishmentServicesList = () => {
  const { selectedEstablishment } = useContext(EstablishmentContext);
  const { user } = useContext(AuthContext);
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Cargar los servicios cuando el componente se monta
  useEffect(() => {
    if (selectedEstablishment.id) {
      fetchServices();
    }
  }, [selectedEstablishment]);
  
  // Función para obtener la lista de servicios desde la API
  const fetchServices = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await getFromApi(`services/establishment/${selectedEstablishment.id}/`);
      const data = await response.json();
      
      console.log('Servicios del establecimiento:', data);
      setServices(data);
      setIsLoading(false);
    } catch (err) {
      console.error('Error al cargar los servicios:', err);
      setError('No se pudieron cargar los servicios del establecimiento. Por favor, intenta de nuevo más tarde.');
      setIsLoading(false);
    }
  };
  
  // Función para manejar el clic en un servicio
  const handleServiceClick = (service) => {
    navigate(`/worker/services/${service.id}`);
  };

  // Función para recargar los servicios
  const reloadServices = () => {
    fetchServices();
  };

  const handleNew = () => {
    navigate('/worker/services/create')
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
          Debes iniciar sesión para ver los servicios.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-white flex items-center">
          <svg className="w-6 h-6 mr-2 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
          </svg>
          Servicios del Establecimiento
        </h2>
        
        <div className="flex flex-col sm:flex-row gap-2 ml-auto">
          <button 
            onClick={handleNew}
            disabled={isLoading}
            className="w-32 px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white rounded-lg transition-colors duration-300 flex items-center justify-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
            </svg>
            {isLoading ? 'Cargando...' : 'Crear'}
          </button>
          
          <button 
            onClick={reloadServices}
            disabled={isLoading}
            className="w-32 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-400 text-white rounded-lg transition-colors duration-300 flex items-center justify-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            {isLoading ? 'Cargando...' : 'Actualizar'}
          </button>
        </div>
      </div>

      {/* Lista de servicios */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            {error}
          </div>
          <button 
            onClick={reloadServices}
            className="mt-2 text-sm underline hover:no-underline"
          >
            Intentar de nuevo
          </button>
        </div>
      ) : services && services.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
          </svg>
          <h3 className="text-lg font-medium text-gray-900">No hay servicios disponibles</h3>
          <p className="mt-2 text-gray-500">
            Este establecimiento aún no tiene servicios registrados.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services && services.map((service) => (
            <SimpleServiceItem 
              key={service.id}
              service={service}
              establishment={selectedEstablishment}
              onClick={handleServiceClick}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default EstablishmentServicesList;