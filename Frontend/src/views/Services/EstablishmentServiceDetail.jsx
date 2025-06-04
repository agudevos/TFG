import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getFromApi, putToApi, postToApi } from '../../utils/functions/api';
import AuthContext from "../../utils/context/AuthContext";
import TimeSlotGrid from '../../components/Reservation/CreateReservation';
import WorkerReservationByServiceList from '../Reservation/WorkerReservationByServiceList';
import WorkerAuctionByServiceList from '../Auctions/AuctionByServiceList';

const ServiceDetail = () => {
  const { user } = useContext(AuthContext);
  const { serviceId } = useParams();
  const [selectedOption, setSelectedOption] = useState('reservas'); 
  const navigate = useNavigate();
  
  // Estado para almacenar los datos del servicio
  const [service, setService] = useState(null);
  
  // Estado para controlar la carga
  const [isLoading, setIsLoading] = useState(true);
  
  // Estado para manejar errores
  const [error, setError] = useState(null);

  // Estado para el modal de confirmación de eliminación
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Estado para indicar si se está eliminando
  const [isDeleting, setIsDeleting] = useState(false);

  // Cargar los datos del servicio cuando el componente se monta
  useEffect(() => {
    if (serviceId) {
      fetchServiceDetail();
    }
  }, [serviceId]);

  // Función para obtener los detalles del servicio
  const fetchServiceDetail = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await getFromApi(`services/${serviceId}/`);
      const data = await response.json();
      setService(data);
      setIsLoading(false);
    } catch (err) {
      console.error('Error al cargar el servicio:', err);
      setError('No se pudieron cargar los detalles del servicio. Por favor, intenta de nuevo más tarde.');
      setIsLoading(false);
    }
  };

  // Función para manejar la eliminación del servicio
  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await postToApi(`services/${serviceId}/delete/`);
      
      // Cerrar modal
      setShowDeleteModal(false);
      
      // Volver al listado después de eliminar
      navigate('/services');
    } catch (err) {
      console.error('Error al eliminar el servicio:', err);
      setError('No se pudo eliminar el servicio. Por favor, intenta de nuevo.');
      setIsDeleting(false);
    }
  };

  // Función para manejar la edición
  const handleEdit = () => {
    navigate(`/services/edit/${serviceId}`);
  };

  // Función para volver atrás
  const handleBack = () => {
    if (user.rol === 'client') {
      navigate('/services/list'); 
    } else if (user.rol === 'worker') {
      navigate('/worker/my-services'); 
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
          Debes iniciar sesión para ver los detalles del servicio.
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            {error}
          </div>
          <button 
            onClick={fetchServiceDetail}
            className="mt-2 text-sm underline hover:no-underline"
          >
            Intentar de nuevo
          </button>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
          <h3 className="text-lg font-medium text-gray-900">Servicio no encontrado</h3>
          <p className="mt-2 text-gray-500">El servicio solicitado no existe o no tienes permisos para verlo.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header con botones de acción */}
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={handleBack}
          className="flex items-center text-cyan-600 hover:text-cyan-700 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
          </svg>
          Volver
        </button>
        
        <div className="flex flex-col sm:flex-row gap-2 ml-auto">
          <button 
            onClick={handleEdit}
            className="w-32 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-300 flex items-center justify-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
            </svg>
            Editar
          </button>
          
          <button 
            onClick={() => setShowDeleteModal(true)}
            className="w-32 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-300 flex items-center justify-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
            Eliminar
          </button>
        </div>
      </div>

      {/* Card principal con detalles del servicio */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header del servicio */}
        <div className="bg-gradient-to-r from-cyan-500 to-cyan-600 px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white">{service.name}</h1>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="p-6">
          {/* Descripción */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Descripción</h3>
            <p className="text-gray-600 leading-relaxed">
              {service.description || 'Sin descripción disponible'}
            </p>
          </div>

          {/* Información en grid */}
          <div className="grid grid-rows gap-6 mb-6">
            {/* Categoría */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-500 mb-1">Categoría</h4>
              <div className="bg-cyan-100 text-cyan-700 px-3 py-1 rounded-full text-sm font-medium inline-block">
                {service.category}
              </div>
            </div>

            {/* Máximo de reserva */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-500 mb-1">Máximo de reserva</h4>
              <p className="text-lg font-semibold text-gray-900">{service.max_reservation} personas</p>
            </div>

            {/* Fianza */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-500 mb-1">Fianza requerida</h4>
              <p className="text-lg font-semibold text-gray-900">{service.deposit} €</p>
            </div>

            {/* Establecimiento */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-500 mb-1">Establecimiento</h4>
              <p className="text-lg font-semibold text-gray-900">ID: {service.establishment}</p>
            </div>
          </div>

          {/* Información adicional */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Información del sistema</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <span className="font-medium">ID del servicio:</span> {service.id}
              </div>
              <div>
                <span className="font-medium">ID del establecimiento:</span> {service.establishment}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <svg className="w-6 h-6 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
              </svg>
              <h3 className="text-lg font-semibold text-gray-900">Confirmar eliminación</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              ¿Estás seguro de que deseas eliminar el servicio "<strong>{service.name}</strong>"? 
              Esta acción no se puede deshacer.
            </p>
            
            <div className="flex space-x-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white rounded-lg transition-colors flex items-center"
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Eliminando...
                  </>
                ) : (
                  'Eliminar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
        <div>
        <div className="flex gap-4 my-8">
          <button
            className={`px-4 py-2 rounded-lg font-semibold transition-colors duration-200 ${
              selectedOption === 'reservas'
                ? 'bg-cyan-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-cyan-100'
            }`}
            onClick={() => setSelectedOption('reservas')}
          >
            Reservas
          </button>
          <button
            className={`px-4 py-2 rounded-lg font-semibold transition-colors duration-200 ${
              selectedOption === 'pujas'
                ? 'bg-cyan-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-cyan-100'
            }`}
            onClick={() => setSelectedOption('pujas')}
          >
            Pujas
          </button>
        </div>
        {selectedOption === 'reservas' ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            {user.rol ==="worker" ? (
              <WorkerReservationByServiceList serviceId={serviceId} />
            ) : (
              <TimeSlotGrid
                serviceId={serviceId}
                serviceName={service.name}
                establishmentId={service.establishment}
              />
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6">
            <WorkerAuctionByServiceList serviceId={serviceId} serviceInfo={false} isClient={user.rol === "client"}/>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceDetail;