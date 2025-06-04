import React, { useState, useEffect, useContext } from 'react';
import SimpleReservationItem from '../../components/Reservation/SimpleReservationItem';
import { deleteFromApi, getFromApi, postToApi } from '../../utils/functions/api';
import AuthContext from "../../utils/context/AuthContext";
import { useNavigate, useParams } from 'react-router';
import { RiContactsBookFill } from 'react-icons/ri';

const WorkerReservationByServiceList = ( serviceId ) => {
  const { user } = useContext(AuthContext);
  const [reservations, setReservations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  console.log('User:', user);

  // Cargar las reservas cuando el componente se monta
  useEffect(() => {
    if (user) {
      fetchReservations();
    }
  }, [user]);
  
  // Función para obtener la lista de reservas desde la API
  const fetchReservations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await getFromApi(`reservations/service/${serviceId.serviceId}/`);
      const data = await response.json();
      
      console.log('Reservas del servicio:', data);
      setReservations(data);
      setIsLoading(false);
    } catch (err) {
      console.error('Error al cargar las reservas:', err);
      setError('No se pudieron cargar las reservas del cliente. Por favor, intenta de nuevo más tarde.');
      setIsLoading(false);
    }
  };

  // Función para recargar las reservas
  const reloadReservations = () => {
    fetchReservations();
  };

  const handleDelete = async (reservation) => {
    try {
        const response = await deleteFromApi(`reservations/${reservation.id}/delete/`);
        fetchReservations(); 
    } catch (error) {
        console.error('Error deleting reservation:', error);
    }
 };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
          Debes iniciar sesión para ver las reservas.
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
              <RiContactsBookFill className='text-cyan-500 mr-2'/> <span className="truncate">Reservas</span>
            </h2>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 ml-auto">
          <button 
            onClick={reloadReservations}
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

      {/* Lista de reservas */}
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
            onClick={reloadReservations}
            className="mt-2 text-sm underline hover:no-underline"
          >
            Intentar de nuevo
          </button>
        </div>
      ) : reservations && reservations.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
          
          <h3 className="text-lg font-semibold text-gray-900 flex items-center justify-center"><RiContactsBookFill className='text-cyan-700 mr-2'/> No hay reservas disponibles</h3>
          <p className="mt-2 text-gray-500">
            Este servicio aún no tiene reservas registradas.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reservations && reservations.map((reservation) => (
            <SimpleReservationItem 
              key={reservation.id}
              reservation={reservation}
              onDelete={handleDelete}
              showClient={true}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default WorkerReservationByServiceList;