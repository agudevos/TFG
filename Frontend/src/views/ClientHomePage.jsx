import React, { useState, useEffect, useContext } from 'react';
import { RiAuctionFill, RiMapPin2Fill, RiListUnordered, RiUser3Fill, RiFireFill } from 'react-icons/ri';
import AuthContext from "../utils/context/AuthContext";
import { getFromApi } from '../utils/functions/api';

// Importar componentes existentes (asumiendo estas rutas)
import SimpleAuctionItem from '../components/Auction/SimpleAuctionItem';
import ServiceItem from '../components/Service/ServiceItem';
import MapaEstablecimientos from '../views/Maps'; // Tu componente de mapa
import { useNavigate } from 'react-router-dom';

const ClientHomepage = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // Estados principales
  const [activeSection, setActiveSection] = useState('para-ti'); // 'para-ti' | 'subastas-activas'
  const [viewMode, setViewMode] = useState('lista'); // 'lista' | 'mapa'
  
  // Estados de datos
  const [participatedAuctions, setParticipatedAuctions] = useState([]);
  const [recommendedServices, setRecommendedServices] = useState([]);
  const [activeAuctions, setActiveAuctions] = useState([]);
  
  // Estados de carga
  const [loadingParticipated, setLoadingParticipated] = useState(true);
  const [loadingRecommended, setLoadingRecommended] = useState(true);
  const [loadingActiveAuctions, setLoadingActiveAuctions] = useState(false);

  // Cargar datos al montar el componente
  useEffect(() => {
    if (user) {
      fetchParticipatedAuctions();
      fetchRecommendedServices();
    }
  }, [user]);

  // Cargar subastas activas cuando se selecciona esa sección
  useEffect(() => {
    if (activeSection === 'subastas-activas' && user) {
      fetchActiveAuctions();
    }
  }, [activeSection, user]);

  // Funciones de carga de datos
  const fetchParticipatedAuctions = async () => {
    try {
      setLoadingParticipated(true);
      const response = await getFromApi('auctions/bid/?active=true');
      const data = await response.json();
      setParticipatedAuctions(data.map(obj => obj.auction_details)); // Solo las primeras 3
    } catch (error) {
      console.error('Error cargando subastas participadas:', error);
    } finally {
      setLoadingParticipated(false);
    }
  };

  const fetchRecommendedServices = async () => {
    try {
      setLoadingRecommended(true);
      const response = await getFromApi('services/recommendations/');
      const data = await response.json();
      setRecommendedServices(data);
    } catch (error) {
      console.error('Error cargando servicios recomendados:', error);
    } finally {
      setLoadingRecommended(false);
    }
  };

  const fetchActiveAuctions = async () => {
    try {
      setLoadingActiveAuctions(true);
      const response = await getFromApi('auctions/active/');
      const data = await response.json();
      setActiveAuctions(data);
    } catch (error) {
      console.error('Error cargando subastas activas:', error);
    } finally {
      setLoadingActiveAuctions(false);
    }
  };

  // Función para manejar clics en servicios
  const handleServiceClick = (service) => {
    // Navegar a detalles del servicio
    console.log('Navegando a servicio:', service.id);
  };

  // Función para manejar clics en subastas
  const handleAuctionClick = (auction) => {
    navigate(`/auctions/${auction.id}`);
  };

  // Componente de carga
  const LoadingSpinner = () => (
    <div className="flex justify-center items-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500"></div>
    </div>
  );

  // Componente de mensaje vacío
  const EmptyState = ({ icon, title, message }) => (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500">{message}</p>
    </div>
  );

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg text-center">
          Debes iniciar sesión para acceder a tu panel personal.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header de bienvenida */}
      <div className="flex justify-center">
        <div className="bg-gray-400 bg-opacity-70 border border-gray-300 rounded-xl p-8 text-center mb-4 w-1/2">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center justify-center">
            <RiUser3Fill className="text-cyan-500 mr-3" />
            ¡Bienvenido, {user.username}!
          </h1>
          <p className="text-white">Tu panel personalizado de actividades y recomendaciones</p>
        </div>
      </div>

      {/* Sección: Subastas en las que has participado */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <RiAuctionFill className="text-cyan-500 mr-2" />
            Mis Subastas Activas
          </h2>
          <span className="text-sm text-gray-500">
            {participatedAuctions.length} activas
          </span>
        </div>

        {loadingParticipated ? (
          <LoadingSpinner />
        ) : participatedAuctions.length === 0 ? (
          <EmptyState 
            icon="🎯"
            title="No tienes subastas activas"
            message="Explora las subastas disponibles y participa para verlas aquí"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {participatedAuctions.map((auction) => (
              <SimpleAuctionItem 
                key={auction.id}
                auction={auction}
                serviceInfo={true}
                onClick={handleAuctionClick}
                isClient={true}
              />
            ))}
          </div>
        )}
      </section>

      {/* Selector de sección principal */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {/* Pestañas de sección */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveSection('para-ti')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeSection === 'para-ti'
                  ? 'bg-white text-cyan-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <RiFireFill className="inline mr-2" />
              Para Ti
            </button>
            <button
              onClick={() => setActiveSection('subastas-activas')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeSection === 'subastas-activas'
                  ? 'bg-white text-cyan-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <RiAuctionFill className="inline mr-2" />
              Subastas Activas
            </button>
          </div>

          {/* Selector de vista */}
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('lista')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'lista'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <RiListUnordered className="inline mr-1" />
              Lista
            </button>
            <button
              onClick={() => setViewMode('mapa')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'mapa'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <RiMapPin2Fill className="inline mr-1" />
              Mapa
            </button>
          </div>
        </div>

        {/* Contenido de la sección activa */}
        <div className="min-h-[400px]">
          {activeSection === 'para-ti' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <RiFireFill className="text-orange-500 mr-2" />
                Recomendaciones Personalizadas
              </h3>
              
              {viewMode === 'lista' ? (
                <>
                  {loadingRecommended ? (
                    <LoadingSpinner />
                  ) : recommendedServices.length === 0 ? (
                    <EmptyState 
                      icon="✨"
                      title="No hay recomendaciones disponibles"
                      message="Interactúa más con la plataforma para recibir recomendaciones personalizadas"
                    />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {recommendedServices.map((service) => (
                        <ServiceItem 
                          key={service.id}
                          service={service}
                          onClick={handleServiceClick}
                        />
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <RiMapPin2Fill className="text-4xl text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Vista de mapa para servicios recomendados</p>
                  <MapaEstablecimientos establecimientos={listaObjetos.map(obj => obj.nombre)} />
                </div>
              )}
            </div>
          )}

          {activeSection === 'subastas-activas' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <RiAuctionFill className="text-cyan-500 mr-2" />
                Todas las Subastas Activas
              </h3>
              
              {viewMode === 'lista' ? (
                <>
                  {loadingActiveAuctions ? (
                    <LoadingSpinner />
                  ) : activeAuctions.length === 0 ? (
                    <EmptyState 
                      icon="🎪"
                      title="No hay subastas activas"
                      message="No hay subastas disponibles en este momento"
                    />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {activeAuctions.map((auction) => (
                        <SimpleAuctionItem 
                          key={auction.id}
                          auction={auction}
                          serviceInfo={true}
                          onClick={handleAuctionClick}
                          isClient={true}
                        />
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <RiMapPin2Fill className="text-4xl text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Vista de mapa para subastas activas</p>
                  <MapaEstablecimientos establecimientos={activeAuctions.map(obj => obj.service_details.establishment_details)} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientHomepage;