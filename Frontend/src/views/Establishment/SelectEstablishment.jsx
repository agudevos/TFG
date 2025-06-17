import React, { useState, useEffect } from 'react';
import { Button, Flex } from "@radix-ui/themes";
import { IoStorefront, IoLocationSharp, IoPeopleSharp, IoAddCircle, IoCheckmarkCircle } from "react-icons/io5";
import { getFromApi } from '../../utils/functions/api';
import {useEstablishment} from '../../utils/context/EstablishmentContext'
import { useNavigate } from 'react-router';

const EstablishmentSelector = () => {
  const { saveSelectedEstablishment, clearSelection } = useEstablishment();
  const [selectedEstablishment, setSelectedEstablishment] = useState(null);
  const [establishments, setEstablishments] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
      clearSelection();
      const fetchData = async () => {
        try {
          await getFromApi("establishments/")
          .then((response) => response.json())
          .then((data) => {
            setEstablishments(data)});
        } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);
  

  const handleCardClick = async (establishment) => {
    await saveSelectedEstablishment(establishment);
    navigate('/worker/establishment/statistics');
  };

  const handleNew = () => {
    navigate('/worker/establishment/create');
  }

  return (
    <Flex direction="column" justify="center" align="center" className="w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mt-11">
        {/* Header */}
        <div className="text-center mb-8 lg:mb-10">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2">
            ¿Qué establecimiento quieres gestionar?
          </h1>
          <p className="text-sm sm:text-base text-white">Selecciona uno de tus establecimientos para administrar</p>
        </div>

        {/* Establishments Grid - Responsive auto-fit grid */}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4 sm:gap-6 lg:gap-8 auto-rows-fr mt">
          {establishments?.map((establishment) => (
            <div
              key={establishment.id}
              onClick={() => handleCardClick(establishment)}
              className={`flex flex-col items-center bg-white p-4 sm:p-6 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 border cursor-pointer relative min-h-[280px] ${
                selectedEstablishment?.id === establishment.id
                  ? 'border-cyan-300 shadow-xl ring-2 ring-cyan-200 transform scale-[1.02]'
                  : 'border-gray-100 hover:border-gray-200'
              }`}
            >
              {/* Selection indicator */}
              {selectedEstablishment?.id === establishment.id && (
                <div className="absolute top-3 right-3 z-10">
                  <IoCheckmarkCircle className="h-5 w-5 sm:h-6 sm:w-6 text-cyan-500" />
                </div>
              )}

              {/* Main icon */}
              <IoStorefront className="h-12 w-12 sm:h-16 sm:w-16 text-cyan-500 mb-3 mt-2 flex-shrink-0" />
              
              {/* Establishment name */}
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 text-center leading-tight">
                {establishment.name}
              </h3>
              
              {/* Establishment details */}
              <div className="text-center text-gray-600 space-y-2 w-full flex-grow flex flex-col justify-center">
                
                {/* Description */}
                <div className="flex items-start justify-center gap-2 min-h-[40px]">
                  <span className="text-xs sm:text-sm leading-relaxed line-clamp-2">
                    {establishment.description}
                  </span>
                </div>
                
                {/* Location */}
                <div className="flex items-center justify-center gap-2">
                  <IoLocationSharp className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
                  <span className="text-xs sm:text-sm truncate max-w-full">
                    {establishment.location}
                  </span>
                </div>
                
                {/* Subscription */}
                <div className="flex items-center justify-center gap-2">
                  <IoPeopleSharp className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
                  <span className="text-xs sm:text-sm font-medium">
                    {establishment.subscription} Plan
                  </span>
                </div>
              </div>

              {/* Selected indicator at bottom */}
              {selectedEstablishment?.id === establishment.id && (
                <div className="mt-3 w-full">
                  <div className="bg-cyan-50 border border-cyan-200 rounded-md p-2">
                    <div className="flex items-center justify-center text-cyan-700">
                      <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full mr-2 animate-pulse"></div>
                      <span className="text-xs font-medium">Seleccionado</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Loading state */}
        {!establishments && (
          <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4 sm:gap-6 lg:gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white p-4 sm:p-6 rounded-lg shadow-md border border-gray-100 min-h-[280px] animate-pulse">
                <div className="flex flex-col items-center">
                  <div className="h-12 w-12 sm:h-16 sm:w-16 bg-gray-200 rounded mb-3 mt-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                  <div className="space-y-2 w-full">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

       {/* Add New Establishment Button */}
        {establishments && establishments.length > 0 && (
          <Button   
                type="button" 
                onClick={handleNew}
                className="flex flex-row items-center justify-center px-6 py-3 bg-cyan-500 text-white hover:bg-cyan-600 focus:outline-none focus:ring-4 focus:ring-cyan-500/50 transition-all duration-300 ease-in-out rounded-md font-medium mt-8 w-auto lg:w-full"
              >
                <IoAddCircle className='mr-2'/> Registrar un nuevo establecimiento
              </Button>
        )}

        {/* Empty state */}
        {establishments && establishments.length === 0 && (
          <div className="text-center py-12">
            <IoStorefront className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay establecimientos
            </h3>
            <p className="text-gray-500 mb-6">
              Aún no tienes establecimientos registrados.
            </p>
            <button className="flex flex-col items-center bg-white p-4 sm:p-6 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 border border-dashed border-gray-300 hover:border-cyan-300 cursor-pointer min-h-[280px] hover:bg-cyan-50 group mx-auto max-w-[280px]">
              <IoAddCircle className="h-12 w-12 sm:h-16 sm:w-16 text-cyan-500 mb-3 mt-2 flex-shrink-0 group-hover:text-cyan-600 transition-colors" />
              
              <h3 className="text-lg sm:text-xl font-bold text-gray-700 mb-3 text-center leading-tight group-hover:text-cyan-700 transition-colors">
                Añadir Primer Establecimiento
              </h3>
              
              <div className="text-center text-gray-500 space-y-2 w-full flex-grow flex flex-col justify-center group-hover:text-cyan-600 transition-colors">
                <span className="text-xs sm:text-sm leading-relaxed">
                  Comienza registrando tu primer establecimiento
                </span>
              </div>
            </button>
          </div>
        )}
      </div>
    </Flex>
  );
};

export default EstablishmentSelector;