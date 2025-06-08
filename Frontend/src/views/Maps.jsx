import React, { useEffect, useRef, useState } from 'react';
import { Wrapper, Status } from '@googlemaps/react-wrapper';
import { getFromApi } from '../utils/functions/api';

const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

// Componente del mapa con clustering
const MapaGoogle = ({ establecimientos, onClick}) => {
  console.log(onClick)
  const mapRef = useRef();
  const [estado, setEstado] = useState('Inicializando...');
  const [procesados, setProcesados] = useState(0);
  const [establishmentGroups, setEstablishmentGroups] = useState({});

  useEffect(() => {
    const inicializarMapa = async () => {
      setEstado('Creando mapa...');
      
      // Crear el mapa centrado en Sevilla
      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: 37.3891, lng: -5.9945 },
        zoom: 13,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true,
      });

      // Crear el servicio de geocoding
      const geocoder = new window.google.maps.Geocoder();
      
      setEstado('Ubicando establecimientos...');
      
      // Función para geocodificar una dirección
      const geocodificarDireccion = (establecimiento) => {
        return new Promise((resolve, reject) => {
          const direccion = establecimiento.establishment_details?.location || establecimiento.location;
          const nombre = establecimiento.name;
          
          geocoder.geocode(
            { address: direccion },
            (results, status) => {
              if (status === 'OK' && results[0]) {
                resolve({
                  ...establecimiento,
                  nombre: nombre,
                  direccion: direccion,
                  position: results[0].geometry.location,
                  direccion_formateada: results[0].formatted_address
                });
              } else {
                console.error(`Error geocodificando ${nombre}:`, status);
                reject(status);
              }
            }
          );
        });
      };

      // Procesar y agrupar establecimientos por ubicación
      const grupos = {};
      let procesadosCount = 0;
      
      for (let i = 0; i < establecimientos.length; i++) {
        try {
          const establecimiento = establecimientos[i];
          const nombre = establecimiento.establishment_details?.name || establecimiento.name;
          setEstado(`Ubicando: ${nombre}...`);
          
          const ubicado = await geocodificarDireccion(establecimiento);
          
          // Crear clave de ubicación con precisión reducida para agrupar ubicaciones cercanas
          const lat = ubicado.position.lat();
          const lng = ubicado.position.lng();
          const locationKey = `${lat.toFixed(4)},${lng.toFixed(4)}`; // Precisión de ~10 metros
          
          if (!grupos[locationKey]) {
            grupos[locationKey] = {
              position: ubicado.position,
              establecimientos: [],
              direccion_formateada: ubicado.direccion_formateada
            };
          }
          
          grupos[locationKey].establecimientos.push(ubicado);
          procesadosCount++;
          setProcesados(procesadosCount);
          
          // Pausa para no exceder límites de la API
          await new Promise(resolve => setTimeout(resolve, 10));
          
        } catch (error) {
          console.error(`Error ubicando establecimiento ${i + 1}:`, error);
        }
      }

      setEstablishmentGroups(grupos);
      setEstado('Creando marcadores...');
      
      const bounds = new window.google.maps.LatLngBounds();
      
      // Crear marcadores para cada grupo
      Object.values(grupos).forEach(grupo => {
        const esGrupo = grupo.establecimientos.length > 1;
        
        const marker = new window.google.maps.Marker({
          position: grupo.position,
          map: map,
          title: grupo.establecimientos.name,
          icon: esGrupo ? getClusterIcon(grupo.establecimientos.length) : getSingleIcon(),
          animation: window.google.maps.Animation.DROP
        });

        // Info window con contenido dinámico
        const infoWindow = new window.google.maps.InfoWindow({
          content: createInfoWindowContent(grupo.establecimientos, grupo.direccion_formateada),
          maxWidth: 350
        });

        marker.addListener('click', () => {
          infoWindow.open(map, marker);
        });

        // Expandir los límites del mapa
        bounds.extend(grupo.position);
      });

      // Ajustar el mapa para mostrar todos los marcadores
      if (Object.keys(grupos).length > 0) {
        map.fitBounds(bounds);
        
        // Evitar zoom excesivo si hay pocos marcadores
        const listener = window.google.maps.event.addListenerOnce(map, 'bounds_changed', () => {
          if (map.getZoom() > 16) {
            map.setZoom(16);
          }
        });
      }

      setEstado(`✅ Completado: ${Object.keys(grupos).length} ubicaciones, ${procesadosCount} establecimientos`);
    };

    if (window.google?.maps && establecimientos.length > 0) {
      inicializarMapa().catch(error => {
        console.error('Error inicializando mapa:', error);
        setEstado('❌ Error inicializando mapa');
      });
    }
  }, [establecimientos]);

  // Icono para clusters (múltiples establecimientos)
  const getClusterIcon = (count) => ({
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
      <svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="18" fill="#06b6d4" stroke="#ffffff" stroke-width="3"/>
        <text x="20" y="26" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="12" font-weight="bold">${count}</text>
      </svg>
    `)}`,
    scaledSize: new window.google.maps.Size(40, 40),
    anchor: new window.google.maps.Point(20, 20)
  });

  // Icono para establecimientos individuales
  const getSingleIcon = () => ({
    path: window.google.maps.SymbolPath.CIRCLE,
    fillColor: '#06b6d4',
    fillOpacity: 0.9,
    strokeColor: '#ffffff',
    strokeWeight: 3,
    scale: 10
  });

  // Crear contenido del info window
  const createInfoWindowContent = (establecimientos, direccionFormateada) => {
    const est = establecimientos[0];
    console.log('Creando contenido para info window:', est);
    return `
      <div style="max-width: 350px; padding: 12px; font-family: system-ui, -apple-system, sans-serif;">
        <h3 style="margin: 0 0 12px 0; color: #1f2937; font-size: 18px; font-weight: 600;">
          ${est.establishment_details.name}
        </h3>
        <div style="margin-bottom: 12px; color: #4b5563; font-size: 14px;">
          📍 ${direccionFormateada}
        </div>
        <div style="max-height: 200px; overflow-y: auto; border-top: 1px solid #e5e7eb; padding-top: 8px;">
          ${establecimientos.map((est, index) => `
            <div style="
                ${index > 0 ? 'border-top: 1px solid #f3f4f6;' : ''}
                padding: 8px 0;
                cursor: pointer;
              " onclick="() => )">
              <div style="font-weight: 600; color: #1f2937; margin-bottom: 4px;">
                ${est.nombre}
              </div>
              <div style="font-size: 12px; color: #6b7280;">
                Click para más detalles
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
    };

  return (
    <div>
      {estado && (
        <div style={{ 
          marginBottom: '10px', 
          padding: '10px', 
          backgroundColor: '#f5f5f5', 
          borderRadius: '5px',
          fontSize: '14px'
        }}>
          <strong>Estado:</strong> {estado}
          {procesados > 0 && establecimientos.length > 0 && (
            <span style={{ marginLeft: '10px' }}>
              ({procesados}/{establecimientos.length})
            </span>
          )}
          {Object.keys(establishmentGroups).length > 0 && (
            <div style={{ marginTop: '5px', fontSize: '12px', color: '#666' }}>
              📍 {Object.keys(establishmentGroups).length} ubicaciones diferentes encontradas
            </div>
          )}
        </div>
      )}
      <div ref={mapRef} style={{ width: '100%', height: '500px', borderRadius: '8px' }} />
    </div>
  );
};

// Componente wrapper para manejar la carga
const MapaWrapper = ({ children }) => {
  const render = (status) => {
    console.log('🗺️ Estado del mapa:', status);
    
    if (status === Status.LOADING) {
      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <div>Cargando Google Maps...</div>
        </div>
      );
    }
    
    if (status === Status.FAILURE) {
      return (
        <div style={{ 
          padding: '20px', 
          backgroundColor: '#fee', 
          border: '1px solid #fcc',
          borderRadius: '5px',
          color: '#c33'
        }}>
          <h3>❌ Error al cargar Google Maps</h3>
          <p>Posibles soluciones:</p>
          <ul style={{ textAlign: 'left' }}>
            <li>Verifica tu API Key en el archivo .env</li>
            <li>Habilita "Maps JavaScript API" en Google Cloud Console</li>
            <li>Habilita "Geocoding API" en Google Cloud Console</li>
            <li>Configura la facturación en tu proyecto de Google Cloud</li>
            <li>Revisa las restricciones de tu API Key</li>
          </ul>
          <p><strong>API Key actual:</strong> {API_KEY ? '✅ Configurada' : '❌ No encontrada'}</p>
        </div>
      );
    }
    
    return children;
  };

  return (
    <Wrapper 
      apiKey={API_KEY} 
      render={render}
    >
      {children}
    </Wrapper>
  );
};

// Componente principal
const MapaEstablecimientos = ({ establecimientos = [], onClick, auction }) => {
  console.log(onClick);
  const [locales, setLocales] = useState([]);

  const handleClick = (service) => {
    console.log('Establecimiento seleccionado:', service);
    if (onClick && auction) {
      auction = establecimientos.filter(obj => obj.service_details?.id === service.id) 
      onClick(auction);
    } else if (onClick) {
      onClick(service);
    }
  };
  
  useEffect(() => {
    if (auction) {
      setLocales(establecimientos.map(obj => obj.service_details));
    } else {
      setLocales(establecimientos);
    }
  }, [establecimientos]);

  return (
    <div style={{ padding: '10px' }}>
      {locales.length > 0 ? (
        <>
          <div style={{ marginBottom: '15px' }}>
            <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
              Mostrando {locales.length} establecimiento{locales.length !== 1 ? 's' : ''}
            </p>
          </div>
          
          <MapaWrapper>
            <MapaGoogle establecimientos={locales} onClick={handleClick}/>
          </MapaWrapper>

          {/* Leyenda */}
          <div style={{ 
            marginTop: '15px', 
            padding: '12px', 
            backgroundColor: '#f8f9fa', 
            borderRadius: '8px',
            fontSize: '13px'
          }}>
            <div style={{ fontWeight: '600', marginBottom: '8px' }}>Leyenda:</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <div style={{ 
                  width: '20px', 
                  height: '20px', 
                  borderRadius: '50%', 
                  backgroundColor: '#06b6d4',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '10px',
                  fontWeight: 'bold'
                }}>N</div>
                <span>Múltiples establecimientos</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <div style={{ 
                  width: '16px', 
                  height: '16px', 
                  borderRadius: '50%', 
                  backgroundColor: '#06b6d4'
                }}></div>
                <span>Establecimiento individual</span>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div style={{ 
          padding: '40px', 
          textAlign: 'center', 
          backgroundColor: '#f9fafb', 
          borderRadius: '8px',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ fontSize: '24px', marginBottom: '10px' }}>🗺️</div>
          <p style={{ color: '#6b7280', margin: 0 }}>
            No hay establecimientos para mostrar en el mapa
          </p>
        </div>
      )}
    </div>
  );
};

export default MapaEstablecimientos;