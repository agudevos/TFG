import { useState } from 'react';
import PropTypes from 'prop-types';

/**
 * Componente para mostrar una subasta simple individual
 */
const SimpleAuctionItem = ({ auction, onDelete, serviceInfo, onClick}) => {
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

  // Función para formatear precio
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  // Función para determinar el estado de la subasta
  const getAuctionStatus = () => {
    const now = new Date();
    const startDate = new Date(auction.starting_date);
    const endDate = new Date(auction.end_date);

    if (now < startDate) {
      return { status: 'upcoming', label: 'Próxima', color: 'bg-blue-100 text-blue-700' };
    } else if (now >= startDate && now <= endDate) {
      return { status: 'active', label: 'En curso', color: 'bg-green-100 text-green-700' };
    } else {
      return { status: 'finished', label: 'Finalizada', color: 'bg-gray-100 text-gray-700' };
    }
  };

  // Función para calcular tiempo restante
  const getTimeRemaining = () => {
    const now = new Date();
    const endDate = new Date(auction.end_date);
    const diffTime = endDate - now;
    
    if (diffTime <= 0) return null;
    
    const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const statusInfo = getAuctionStatus();
  const timeRemaining = getTimeRemaining();

  const handleConfirmDelete = () => {
    setShowDeleteModal(false);
    if (onDelete) {
      onDelete(auction);
    }
  };

  return (
    <div 
      className={`bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer
        ${statusInfo.status === 'finished' ? 'opacity-60' : ''}`}
      onClick={() => onClick && onClick(auction)}
    >
      <div className="bg-gradient-to-r from-cyan-500 to-cyan-600 px-4 py-2">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-white truncate">
            Subasta #{auction.id}
          </h3>
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color} bg-white bg-opacity-20 text-white`}>
            {statusInfo.label}
          </div>
        </div>
      </div>
      
      <div className="p-6">
        {/* Información del servicio */}
        {serviceInfo && <div className="mb-4">
          <div className="bg-cyan-50 text-cyan-700 px-3 py-1 rounded-full text-sm font-medium inline-block mb-2">
            {auction.service_details?.name || `Servicio #${auction.service}`}
          </div>
          {auction.service_details?.category && (
            <p className="text-gray-600 text-sm">
              Categoría: {auction.service_details.category}
            </p>
          )}
        </div>}

        {/* Información de la puja inicial */}
        <div className="mb-4 p-3 bg-green-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Puja inicial</p>
              <p className="text-xl font-bold text-green-600">
                {formatPrice(auction.starting_bid)}
              </p>
            </div>
            {timeRemaining && statusInfo.status === 'active' && (
              <div className="text-right">
                <p className="text-sm text-gray-600">Tiempo restante</p>
                <p className="text-lg font-semibold text-orange-600">
                  {timeRemaining}
                </p>
              </div>
            )}
          </div>
        </div>
        
        {/* Fechas de la subasta */}
        <div className="pt-4 border-t border-gray-100 space-y-3 text-sm">
          <div className="flex items-center text-gray-600">
            <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <div>
              <span className="font-medium text-gray-700">Inicio:</span>
              <div className="text-gray-900">{formatDate(auction.starting_date)}</div>
            </div>
          </div>
          
          <div className="flex items-center text-gray-600">
            <svg className="w-4 h-4 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <div>
              <span className="font-medium text-gray-700">Fin:</span>
              <div className="text-gray-900">{formatDate(auction.end_date)}</div>
            </div>
          </div>
        </div>

        {/* Información adicional y botones */}
        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="flex justify-between items-center text-xs text-gray-500 mb-3">
            <div>
              <span className="font-medium">Tiempo otorgado:</span> {auction.time_frame} min
            </div>
          </div>
          
          {/* Botones de acción */}
          <div className="flex justify-end gap-2">
            {statusInfo.status === 'upcoming' || statusInfo.status === 'active' && !serviceInfo && (
              <button
                className="px-3 py-2 text-sm rounded bg-red-600 text-white hover:bg-red-700 transition-colors"
                onClick={e => {
                  e.stopPropagation();
                  setShowDeleteModal(true);
                }}
              >
                Cancelar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full">
            <h2 className="text-xl font-semibold mb-4">Confirmar cancelación</h2>
            <p className="mb-4">
              ¿Estás seguro de que quieres cancelar la subasta <b>#{auction.id}</b>?
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
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

SimpleAuctionItem.propTypes = {
  auction: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    starting_date: PropTypes.string.isRequired,
    end_date: PropTypes.string.isRequired,
    starting_bid: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    time_frame: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    service: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    service_details: PropTypes.shape({
      name: PropTypes.string,
      category: PropTypes.string,
      deposit: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    })
  }).isRequired,
  onDelete: PropTypes.func
};

export default SimpleAuctionItem;