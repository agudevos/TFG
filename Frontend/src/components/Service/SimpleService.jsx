import React from 'react';
import PropTypes from 'prop-types';

/**
 * Componente para mostrar un servicio simple individual
 * Adaptado para el formato simplificado de servicio sin slots
 */
const SimpleServiceItem = ({ service, onClick, establishment }) => {
  return (
    <div 
      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
      onClick={() => onClick && onClick(service)}
    >
      <div className="bg-gradient-to-r from-cyan-500 to-cyan-600 px-4 py-2">
        <h3 className="text-lg font-bold text-white truncate">{service.name}</h3>
      </div>
      <div className="p-6"> 
        <p className="text-gray-600 mb-4 line-clamp-2">{service.description}</p>
        
        <div className="flex justify-between items-center mb-4">
          <div className="bg-cyan-50 text-cyan-700 px-3 py-1 rounded-full text-sm font-medium">
            {service.category}
          </div>
        </div>
        
        <div className="pt-4 border-t border-gray-100 grid grid-cols-2 gap-4 text-sm">
          <div className="text-gray-600">
            <span className="font-medium text-gray-700">Máx. reserva:</span>
            <div className="text-gray-900">{service.max_reservation} personas</div>
          </div>
          <div className="text-gray-600">
            <span className="font-medium text-gray-700">Fianza:</span>
            <div className="text-gray-900">{service.deposit} €</div>
          </div>
        </div>
        
        <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
          <span className="font-medium">Establecimiento:</span> {establishment.name}
        </div>
      </div>
    </div>
  );
};

SimpleServiceItem.propTypes = {
  service: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    category: PropTypes.string.isRequired,
    max_reservation: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    deposit: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    establishment: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired
  }).isRequired,
  onClick: PropTypes.func
};

export default SimpleServiceItem;