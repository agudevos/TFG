import React, { useEffect, useRef, useState } from 'react';
import { Wrapper, Status } from '@googlemaps/react-wrapper';
import { getFromApi } from '../utils/functions/api';


const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

// Componente del mapa
const MapaGoogle = ({ establecimientos }) => {
  const mapRef = useRef();
  const [estado, setEstado] = useState('Inicializando...');
  const [procesados, setProcesados] = useState(0);

  useEffect(() => {
    const inicializarMapa = async () => {
      setEstado('Creando mapa...');
      
      // Crear el mapa centrado en Sevilla
      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: 37.3891, lng: -5.9945 },
        zoom: 13,
      });

      // Crear el servicio de geocoding
      const geocoder = new window.google.maps.Geocoder();
      
      setEstado('Ubicando establecimientos...');
      
      // Función para geocodificar una dirección
      const geocodificarDireccion = (establecimiento) => {
        return new Promise((resolve, reject) => {
          geocoder.geocode(
            { address: establecimiento.location },
            (results, status) => {
              if (status === 'OK' && results[0]) {
                resolve({
                  ...establecimiento,
                  position: results[0].geometry.location,
                  direccion_formateada: results[0].formatted_address
                });
              } else {
                console.error(`Error geocodificando ${establecimiento.name}:`, status);
                reject(status);
              }
            }
          );
        });
      };

      // Procesar todos los establecimientos
      let establecimientosUbicados = [];
      
      for (let i = 0; i < establecimientos.length; i++) {
        try {
          const establecimiento = establecimientos[i];
          setEstado(`Ubicando: ${establecimiento.name}...`);
          
          const ubicado = await geocodificarDireccion(establecimiento);
          establecimientosUbicados.push(ubicado);
          
          setProcesados(i + 1);
          
          // Pausa para no exceder límites de la API
          await new Promise(resolve => setTimeout(resolve, 10));
          
        } catch (error) {
          console.error(`Error ubicando establecimiento ${i + 1}:`, error);
        }
      }

      // Crear marcadores para los establecimientos ubicados
      setEstado('Creando marcadores...');
      
      const bounds = new window.google.maps.LatLngBounds();
      
      establecimientosUbicados.forEach(establecimiento => {
        const marker = new window.google.maps.Marker({
          position: establecimiento.position,
          map: map,
          title: establecimiento.nombre,
          animation: window.google.maps.Animation.DROP
        });

        // Info window al hacer click
        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="max-width: 250px; padding: 10px;">
              <h3 style="margin: 0 0 10px 0; color: #1976d2;">
                ${establecimiento.nombre}
              </h3>
              <p style="margin: 0; color: #666; font-size: 14px;">
                📍 ${establecimiento.direccion_formateada}
              </p>
            </div>
          `
        });

        marker.addListener('click', () => {
          infoWindow.open(map, marker);
        });

        // Expandir los límites del mapa
        bounds.extend(establecimiento.position);
      });

      // Ajustar el mapa para mostrar todos los marcadores
      if (establecimientosUbicados.length > 0) {
        map.fitBounds(bounds);
        
        // Evitar zoom excesivo si hay pocos marcadores
        const listener = window.google.maps.event.addListenerOnce(map, 'bounds_changed', () => {
          if (map.getZoom() > 16) {
            map.setZoom(16);
          }
        });
      }

      setEstado(`✅ Completado: ${establecimientosUbicados.length} de ${establecimientos.length} ubicados`);
    };

    if (window.google?.maps) {
      inicializarMapa().catch(error => {
        console.error('Error inicializando mapa:', error);
        setEstado('❌ Error inicializando mapa');
      });
    }
  }, [establecimientos]);

  return <div ref={mapRef} style={{ width: '100%', height: '500px' }} />;
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
      version="beta"
      libraries={['marker']}
    >
      {children}
    </Wrapper>
  );
};

// Componente principal
const MapaEstablecimientos = ({ establecimientos }) => {
  const [locales, setLocales] = useState([]);
  console.log('Locales iniciales:', locales);

  useEffect(() => {
    setLocales(establecimientos);
  }, [establecimientos]);
  // Función para cargar desde tu API
  const cargarEstablecimientos = async () => {
    try {
      const response = await getFromApi('establishments/');
      const data = await response.json();
      setLocales(data);
    } catch (error) {
      console.error('Error cargando establecimientos:', error);
      // Usar datos de ejemplo si falla la API
    }
  };

  // useEffect(() => {
  //   // Comentado para usar datos de ejemplo
  //   cargarEstablecimientos();
  // }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h1>Mapa de Establecimientos</h1>
      <p>Mostrando {locales.length} establecimientos</p>
      
      <MapaWrapper>
        <MapaGoogle establecimientos={locales} />
      </MapaWrapper>

    </div>
  );
}

export default MapaEstablecimientos;