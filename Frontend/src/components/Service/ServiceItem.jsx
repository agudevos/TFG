import React from 'react';
import PropTypes from 'prop-types';

/**
 * Componente para mostrar un elemento de servicio individual
 * Puede ser reutilizado en diferentes vistas
 */
const ServiceItem = ({ service, onClick }) => {
  console.log('ServiceItem renderizado con servicio:', service);
  return (
    <div 
      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
      onClick={() => onClick && onClick(service)}
    >
      <div className="bg-gradient-to-r from-cyan-500 to-cyan-600 px-4 py-2">
        <h3 className="text-lg font-bold text-white truncate">{service.service_details.name}</h3>
      </div>
      <div className="p-6"> 
        <p className="text-gray-600 mb-4 line-clamp-2">{service.service_details.description}</p>
        <div className="flex justify-between items-center">
          <div className="bg-cyan-50 text-cyan-700 px-3 py-1 rounded-full text-sm font-medium">
            {service.service_details.category}
          </div>  
        </div>
        
        {/* Listado de slots */}
        {service.slots && service.slots.length > 0 && (
          <div className="mt-4 pt-3 border-t border-gray-100">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Horarios disponibles:</h4>
            <div className="space-y-2">
              {service.slots.map((slot) => (
                <div key={slot.id} className="bg-gray-50 rounded-lg p-2 flex justify-between items-center">
                  <div className="flex items-center">
                    <span className="text-xs bg-cyan-100 text-cyan-700 px-2 py-1 rounded mr-2">
                      {slot.name}
                    </span>
                    <span className="text-xs text-gray-600">
                      {slot.start_time.substring(0, 5)} - {slot.end_time.substring(0, 5)}
                    </span>
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    {slot.price} €
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between text-sm text-gray-500">
          <div>
            <span className="font-medium">Máx. reserva:</span> {service.service_details.max_reservation || 'Sin máximo'}
          </div>
          <div>
            <span className="font-medium">Fianza:</span> {`${service.service_details.deposit} €`}
          </div>
        </div>
      </div>
    </div>
  );
};

ServiceItem.propTypes = {
  service: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    service_details: PropTypes.shape({
      name: PropTypes.string.isRequired,
      description: PropTypes.string,
      category: PropTypes.string,
      max_reservation: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      deposit: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    }).isRequired,
    slots: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        name: PropTypes.string,
        start_time: PropTypes.string,
        end_time: PropTypes.string,
        price: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      })
    ),
    price: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  }).isRequired,
  onClick: PropTypes.func
};

export default ServiceItem;