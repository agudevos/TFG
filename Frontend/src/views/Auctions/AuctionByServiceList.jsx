import React, { useState, useEffect, useContext } from 'react';
import SimpleAuctionItem from '../../components/Auction/SimpleAuctionItem';
import { deleteFromApi, getFromApi, postToApi } from '../../utils/functions/api';
import AuthContext from "../../utils/context/AuthContext";
import { useNavigate, useParams } from 'react-router';
import { RiAuctionFill } from 'react-icons/ri';
import { set } from 'react-hook-form';

const WorkerAuctionByServiceList = ( serviceId ) => {
  const { user } = useContext(AuthContext);
  const [auctions, setAuctions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  

  // Cargar las subastas cuando el componente se monta
  useEffect(() => {
    if (user) {
      fetchAuctions();
    }
  }, [user]);
  
  // Función para obtener la lista de subastas desde la API
  const fetchAuctions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await getFromApi(`auctions/service/${serviceId.serviceId}/`);
      const data = await response.json();
      console.log('Subastas del servicio:', data);
      console.log('Is Client:', serviceId.isClient);
      if (serviceId.isClient) {
        console.log("Filtering active auctions for client view");
        const activeAuctions = data.filter(auction => {
          const start = new Date(auction.starting_date);
          const end = new Date(auction.end_date);
          const now = new Date();
          return start <= now && end >= now;
        });
        setAuctions(activeAuctions);
      } else {
        setAuctions(data);
      }
      setIsLoading(false);
    } catch (err) {
      console.error('Error al cargar las subastas:', err);
      setError('No se pudieron cargar las subastas del servicio. Por favor, intenta de nuevo más tarde.');
      setIsLoading(false);
    }
  };

  // Función para recargar las subastas
  const reloadAuctions = () => {
    fetchAuctions();
  };

  const handleAuctionClick = (auction) => {
    navigate(`/auctions/${auction.id}`);
  };

  const handleNew = () => {
    navigate(`/worker/auctions/create?serviceId=${serviceId.serviceId}`)
  };

  const handleDelete = async (auction) => {
    try {
        const response = await deleteFromApi(`auctions/${auction.id}/delete/`);
        fetchAuctions(); 
    } catch (error) {
        console.error('Error deleting auction:', error);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
          Debes iniciar sesión para ver las subastas.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-14">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <div>
            <h2 className="flex items-center flex-wrap text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold text-grey-700">
              <RiAuctionFill className='text-cyan-500 mr-2'/> <span className="truncate">Subastas</span>
            </h2>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 ml-auto">
          {!serviceId.isClient && <button 
            onClick={handleNew}
            disabled={isLoading}
            className="w-32 px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white rounded-lg transition-colors duration-300 flex items-center justify-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
            </svg>
            {isLoading ? 'Cargando...' : 'Crear'}
          </button>}

          <button 
            onClick={reloadAuctions}
            disabled={isLoading}
            className="w-full sm:w-32 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-400 text-white rounded-lg transition-colors duration-300 flex items-center justify-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            {isLoading ? 'Cargando...' : 'Actualizar'}
          </button>
        </div>
      </div>

      {/* Lista de subastas */}
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
            onClick={reloadAuctions}
            className="mt-2 text-sm underline hover:no-underline"
          >
            Intentar de nuevo
          </button>
        </div>
      ) : auctions && auctions.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center justify-center">
            <RiAuctionFill className='text-cyan-700 mr-2'/> No hay subastas disponibles
          </h3>
          <p className="mt-2 text-gray-500">
            {serviceId.isClient ? (<span>Este servicio no tiene subastas activas.</span>):(<span>Este servicio aún no tiene subastas registradas.</span>)}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {auctions && auctions.map((auction) => (
            <SimpleAuctionItem 
              key={auction.id}
              auction={auction}
              onDelete={handleDelete}
              serviceInfo={serviceId.serviceInfo}
              onClick={handleAuctionClick}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default WorkerAuctionByServiceList;