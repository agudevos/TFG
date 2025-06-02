import React, {useState } from 'react';
import PropTypes from 'prop-types';

/**
 * Componente para mostrar una reserva simple individual
 */
const SimpleReservationItem = ({ reservation, showClient = true, onDelete }) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  
  // Función para formatear fechas
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Función para determinar el estado de la reserva
  const getReservationStatus = () => {
    const now = new Date();
    const startDate = new Date(reservation.starting_date);
    const endDate = new Date(reservation.end_date);

    if (now < startDate) {
      return { status: 'upcoming', label: 'Próxima', color: 'bg-blue-100 text-blue-700' };
    } else if (now >= startDate && now <= endDate) {
      return { status: 'active', label: 'En curso', color: 'bg-green-100 text-green-700' };
    } else {
      return { status: 'completed', label: 'Finalizada', color: 'bg-gray-100 text-gray-700' };
    }
  };

  const statusInfo = getReservationStatus();

  const handleConfirmDelete = () => {
    setShowDeleteModal(false);
    if (onDelete) {
      onDelete(reservation);
    }
  };

  return (
    <div 
      className={`bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer
        ${statusInfo.status === 'completed' ? 'opacity-60' : ''}`}
    >
      <div className="bg-gradient-to-r from-cyan-500 to-cyan-600 px-4 py-2">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-white truncate">
            Reserva #{reservation.id}
          </h3>
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color} bg-white bg-opacity-20 text-white`}>
            {statusInfo.label}
          </div>
        </div>
      </div>
      
      <div className="p-6">
        {/* Información del servicio */}
        <div className="mb-4">
          <div className="bg-cyan-50 text-cyan-700 px-3 py-1 rounded-full text-sm font-medium inline-block mb-2">
            {reservation.service_details?.name || `Servicio #${reservation.service}`}
          </div>
          {reservation.service_details?.category && (
            <p className="text-gray-600 text-sm">
              Categoría: {reservation.service_details.category}
            </p>
          )}
        </div>

        {/* Información del cliente (si se debe mostrar) */}
        {showClient && reservation.client_details && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <span className="font-medium text-gray-700">Datos del Cliente:</span>
            </p>
            <p className="text-gray-900 font-medium">
              {reservation.client_details.user_details.name} {reservation.client_details.user_details.surname}
            </p>
            <p className="text-gray-600 text-sm">
              {reservation.client_details.user_details.email}
            </p>
          </div>
        )}
        
        {/* Fechas de la reserva */}
        <div className="pt-4 border-t border-gray-100 space-y-3 text-sm">
          <div className="flex items-center text-gray-600">
            <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <div>
              <span className="font-medium text-gray-700">Inicio:</span>
              <div className="text-gray-900">{formatDate(reservation.starting_date)}</div>
            </div>
          </div>
          
          <div className="flex items-center text-gray-600">
            <svg className="w-4 h-4 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <div>
              <span className="font-medium text-gray-700">Fin:</span>
              <div className="text-gray-900">{formatDate(reservation.end_date)}</div>
            </div>
          </div>
        </div>

        {/* Información adicional del servicio */}
        {reservation.service_details && (
          <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
            <div className="grid grid-cols-3 gap-1">
              {reservation.service_details.max_reservation && (
                <div>
                  <span className="font-medium">Máx. personas:</span> {reservation.service_details.max_reservation}
                </div>
              )}
              {reservation.service_details.deposit && (
                <div>
                  <span className="font-medium">Fianza:</span> {reservation.service_details.deposit} €
                </div>
              )}
              {statusInfo.label === 'Próxima' && (
                <div className="flex justify-end">
                  <button
                    className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition-colors"
                    onClick={e => {
                      e.stopPropagation();
                      setShowDeleteModal(true);
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      {/* Botón eliminar */}
        
      </div>

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full">
            <h2 className="text-xl font-semibold mb-4">Confirmar eliminación</h2>
            <p className="mb-4">
              ¿Estás seguro de que quieres eliminar la reserva <b>#{reservation.id}</b>?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={e => {
                  e.stopPropagation();
                  setShowDeleteModal(false);
                }}
                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
              >
                Cancelar
              </button>
              <button
                onClick={e => {
                  e.stopPropagation();
                  handleConfirmDelete();
                }}
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

SimpleReservationItem.propTypes = {
  reservation: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    starting_date: PropTypes.string.isRequired,
    end_date: PropTypes.string.isRequired,
    client: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    service: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    client_details: PropTypes.shape({
      name: PropTypes.string,
      surname: PropTypes.string,
      email: PropTypes.string
    }),
    service_details: PropTypes.shape({
      name: PropTypes.string,
      category: PropTypes.string,
      max_reservation: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      deposit: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    })
  }).isRequired,
  onClick: PropTypes.func,
  showClient: PropTypes.bool
};

export default SimpleReservationItem;