import { useState, useEffect, useContext} from 'react';
import { getFromApi, postToApi } from '../../utils/functions/api';
import AuthContext from '../../utils/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { CreateCheckoutCreditSession } from '../../utils/functions/stripe';


const TimeSlotGrid = ({ serviceId }) => {
  const { user } = useContext(AuthContext);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [sortedSlots, setSortedSlots] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [serviceData, setServiceData] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [client, setClient] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchClientDetails();
    }
  }, [user]);
  

  const fetchClientDetails = async () => {
      try {
        const response = await getFromApi(`clients/detail/`);
        const data = await response.json();
        setClient(data);
      } catch (err) {
        console.error('Error al cargar los detalles del cliente:', err);
      }
    };

  useEffect(() => {
        if (selectedDate){
            retrieveData(); 
        }
    }, [selectedDate]);

  const retrieveData = async () => {
    try {
    setIsLoading(true);

    // Obtener datos del servicio
    const params = new URLSearchParams();
    params.append('service', serviceId);
    params.append('date', selectedDate);
    console.log('Dates seleccionadas:', selectedDate);
    const response = await getFromApi(`services/recomendations/?${params.toString()}`);
    let slotsData = await response.json();
    console.log('Datos del servicio obtenidos:', slotsData);
    setServiceData(slotsData[0]);

    // Obtener reservas para el servicio en la fecha seleccionada
    const reservation_params = new URLSearchParams();
    reservation_params.append('date', selectedDate);
    const reservations_response = await getFromApi(`reservations/service/${serviceId}/?${params.toString()}`);
    let reservationData = await reservations_response.json();
    console.log('Datos de reserva del servicio obtenidos:', reservationData);
    setReservations(reservationData);
    setIsLoading(false);
    } catch (error) {   
    console.error('Error al obtener los datos del servicio:', error);
    setIsLoading(false);
    } 
  };

  // Función para generar franjas de 30 minutos dentro de un horario
  const generateTimeSlots = (startTime, endTime) => {
    const slots = [];
    console.log(selectedDate);
    const start = new Date(`${selectedDate}T${startTime}`);
    const end = new Date(`${selectedDate}T${endTime}`);
    
    let current = new Date(start);
    let slotId = 0;
    
    while (current < end) {
      const next = new Date(current.getTime() + 30 * 60000); // +30 minutos
      if (next <= end) {
        const slotStart = current.toTimeString().slice(0, 5);
        const slotEnd = next.toTimeString().slice(0, 5);
        const overlapsReservation = reservations.some(res => {
          const resStart = res.starting_date.slice(11, 16);
          const resEnd = res.end_date.slice(11, 16);
          return (
            (slotStart < resEnd && slotEnd > resStart)
          );
        });
        if (overlapsReservation) {
          current = next;
          continue;
        }
        slots.push({
          id: slotId++,
          startTime: current.toTimeString().slice(0, 5),
          endTime: next.toTimeString().slice(0, 5),
          selected: false
        });
      }
      current = next;
    }
    
    return slots;
  };

  // Generar todos los slots disponibles para el servicio
  const getAllTimeSlots = () => {
    const allSlots = [];
    console.log('Datos del servicio:', serviceData);
    serviceData?.slots.forEach((slot, slotIndex) => {
        console.log(`Procesando slot ${slotIndex}:`, slot);
      const timeSlots = generateTimeSlots(slot.start_time, slot.end_time);
      timeSlots.forEach(timeSlot => {
        allSlots.push({
          ...timeSlot,
          id: `${slotIndex}-${timeSlot.id}`,
          slotInfo: slot,
          price: slot.price/2
        });
      });
    });
    return allSlots;
  };

  const timeSlots = serviceData?.length !== 0 && !isLoading && selectedDate ? getAllTimeSlots() : [];
  console.log('Franjas horarias generadas:', timeSlots);
  // Manejar selección de franjas horarias
  const toggleSlotSelection = (slotId) => {
    setSelectedSlots(prev => {
      if (prev.includes(slotId)) {
        return prev.filter(id => id !== slotId);
      } else {
        return [...prev, slotId];
      }
    });
  };

  // Función para enviar reserva al backend
  const handleReservation = async () => {

    setIsLoading(true);

    const reservationData = {
      service: serviceData.service_details.id,
      starting_date: `${selectedDate}T${sortedSlots[0].startTime}:00`,
      end_date: `${selectedDate}T${sortedSlots[sortedSlots.length - 1].endTime}:00`
    };
    console.log('Datos de la reserva:', reservationData);
    try {
      // Llamar a la función proporcionada por el componente padre
      if (client.credits > totalPrice) {
        await postToApi(`client/${client.id}/update/`, {
          credits: client.credits - totalPrice})
        await postToApi('reservations/create/', reservationData);
      } else {
        const quantity = totalPrice - client.credits;
        const priceId = "price_1RVCT8PB8XNLsDsu66gFfTAH"; 
        CreateCheckoutCreditSession(priceId, quantity, reservationData.service, reservationData.starting_date, reservationData.end_date).then((session) => {
        window.location.href = JSON.parse(session).url;
      });
      }
      
      // Limpiar selección después de reserva exitosa
      setSelectedSlots([]);
      
    } catch (error) {
      console.error('Error al realizar la reserva:', error);
      alert('Error al realizar la reserva. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
      navigate('/client/reservations/list');

    }
  };

  const handleOpenModal = () => {
    if (!selectedDate) {
      alert('Por favor, selecciona una fecha');
      return;
    }
    if (selectedSlots.length === 0) {
      alert('Por favor, selecciona al menos una franja horaria');
      return;
    }
    
    // Validar que los slots seleccionados son continuos
    const selectedSlotsData = timeSlots.filter(slot =>
    selectedSlots.includes(slot.id)
    );
    // Ordenar por hora de inicio
    const helper =[...selectedSlotsData].sort(
    (a, b) => a.startTime.localeCompare(b.startTime)
    );
    setSortedSlots(helper);
    let continuos = true;
    for (let i = 1; i < helper.length; i++) {
    if (helper[i - 1].endTime !== helper[i].startTime) {
        continuos = false;
        break;
    }
    }
    if (!continuos) {
    alert('Las franjas seleccionadas deben ser continuas.');
    return;
    }
    setShowModal(true);
  };

  // Nuevo: función para cancelar el modal
  const handleCancelModal = () => {
    setShowModal(false);
  };

  const totalPrice = timeSlots
    .filter(slot => selectedSlots.includes(slot.id))
    .reduce((sum, slot) => sum + slot.price, 0);

  return (
    <div className="w-full mt-6">
      {/* Botón de reservar, selector de fecha y total */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <input
            type="date"
            value={selectedDate}
            onChange={e => {
              setSelectedDate(e.target.value);
              setSelectedSlots([]); // Limpiar selección al cambiar fecha
            }}
            className="border border-gray-300 rounded-lg px-3 py-2"
          />
          <button
            onClick={handleOpenModal}
            disabled={selectedSlots.length === 0 || isLoading || !selectedDate}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            {isLoading ? 'Procesando...' : 'Reservar'}
          </button>
        </div>

        {/* Modal de confirmación */}
        {showModal && (
            <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full">
                <h2 className="text-xl font-semibold mb-4">Confirmar reserva</h2>
                <p className="mb-4">
                ¿Estás seguro de que quieres realizar la reserva para el día <b>{selectedDate}</b> de <b>{sortedSlots[0].startTime}</b> a <b>{sortedSlots[sortedSlots.length - 1].endTime}</b> ?
                </p>
                <p className="mb-4">Total: <b>€{totalPrice.toFixed(2)}</b></p>
                <p className="mb-4">Creditos disponibles: <b>{client ? client.credits : 'Cargando...'}</b></p>
                <div className="flex justify-end gap-3">
                <button
                    onClick={handleCancelModal}
                    className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
                    disabled={isLoading}
                >
                    Cancelar
                </button>
                <button
                    onClick={handleReservation}
                    className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                    disabled={isLoading}
                >
                    {client?.credits >= totalPrice ? (
                     <p> Confirmar</p>
                    ) : (
                      <p>Pagar y reservar</p>
                    )}
                </button>
                </div>
            </div>
            </div>
        )}
        
        {selectedSlots.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden px-4 py-4 text-right w-full sm:w-auto">
            <p className="text-lg font-semibold">
              Total: €{totalPrice.toFixed(2)}
            </p>
            <p className="text-sm text-gray-600">
              {selectedSlots.length} franja{selectedSlots.length !== 1 ? 's' : ''} seleccionada{selectedSlots.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>

      {/* Grid de franjas horarias */}
      {selectedDate && timeSlots.length > 0 ? (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden px-4 py-4 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
          {timeSlots.map((slot) => (
            <div
              key={slot.id}
              onClick={() => toggleSlotSelection(slot.id)}
              style={{ 
              backgroundColor: slot.slotInfo.color,
              opacity: selectedSlots.includes(slot.id) ? 1 : 0.7
            }}
            className={`
              relative p-3 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:scale-105 hover:opacity-90
              ${selectedSlots.includes(slot.id)
                ? 'border-white shadow-lg scale-105'
                : 'border-gray-300 hover:border-white'
              }
            `}
            >
              <div className="text-center">
                <div className="text-sm font-medium text-gray-800">
                  {slot.startTime}
                </div>
                <div className="text-xs text-gray-600">
                  {slot.endTime}
                </div>
                <div className="text-xs font-semibold text-blue-600 mt-1">
                  €{slot.price}
                </div>
              </div>
              
              {/* Indicador de selección */}
              {selectedSlots.includes(slot.id) && (
                <div className="absolute top-1 right-1 w-3 h-3 bg-blue-500 rounded-full"></div>
              )}
            </div>
          ))}
        </div>
      ) : selectedDate && timeSlots.length === 0 ? (
        <div className="text-center py-8 text-white">
          No hay franjas horarias disponibles
        </div>
      ) : null}
    </div>
  );
};

export default TimeSlotGrid;