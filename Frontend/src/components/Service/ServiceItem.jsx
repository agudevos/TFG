import React from 'react';
import PropTypes from 'prop-types';

/**
 * Componente para mostrar un elemento de servicio individual
 * Puede ser reutilizado en diferentes vistas
 */
const ServiceItem = ({ service, onClick }) => {
  return (
    <div 
      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
      onClick={() => onClick && onClick(service)}
    >
      <div className="bg-gradient-to-r from-cyan-500 to-cyan-600 px-4 py-2">
        <h3 className="text-lg font-bold text-white truncate">{service.name}</h3>
      </div>
      <div className="p-6">
        <p className="text-gray-600 mb-4 line-clamp-2">{service.description || service.descripcion}</p>
        <div className="flex justify-between items-center">
          <div className="bg-cyan-50 text-cyan-700 px-3 py-1 rounded-full text-sm font-medium">
            {service.category}
          </div>
          <div className="font-bold text-gray-900">
            {service.price || (service.deposit ? `${service.deposit} €` : 'Sin precio')}
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between text-sm text-gray-500">
          <div>
            <span className="font-medium">Máx. reserva:</span> {service.max_reservation || 'No definido'}
          </div>
          <div>
            <span className="font-medium">Fianza:</span> {service.deposit ? `${service.deposit} €` : 'N/A'}
          </div>
        </div>
      </div>
    </div>
  );
};

ServiceItem.propTypes = {
  service: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    descripcion: PropTypes.string, // Alternativa según API
    category: PropTypes.string,
    max_reservation: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    deposit: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    price: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  }).isRequired,
  onClick: PropTypes.func
};

export default ServiceItem;