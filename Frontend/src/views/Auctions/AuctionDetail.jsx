import { useEffect, useState, useContext } from "react";
import { getFromApi, postToApi } from "../../utils/functions/api";
import { FormContainer } from "../../components/Form";
import { useParams } from "react-router-dom";
import AuthContext from "../../utils/context/AuthContext";


const AuctionDetail =  ({}) => {
    const { user } = useContext(AuthContext);
    const { auctionId } = useParams();
    const [auction, setAuction] = useState([])
    const [service, setService] = useState([])
    const [bids, setBids] = useState([])
    const [events, setEvents] = useState([])
    const [claveSeleccionada, setClaveSeleccionada] = useState('');
    const [subClaves, setSubClaves] = useState([]);
    const [createSuccess, setCreateSuccess] = useState(false);
    const [error, setError] = useState("");

    const [tiempoRestante, setTiempoRestante] = useState({
        porcentaje: 0,
        color: "bg-green-500",
        diasRestantes: 0,
        texto: ""
      });

    useEffect(() => {
        getFromApi(`auctions/${auctionId}/`)
        .then((response) => response.json())
        .then((data) => {
            setAuction(data)
            console.log("Auction data:",data.id)
            const serviceId = data.service
            if (serviceId) {
              getFromApi(`services/${serviceId}/`)
              .then((response) => response.json())
              .then((data) => setService(data))
            }
        getFromApi(`auctions/events/${auctionId}/`)
        .then((response) => response.json())
        .then((data) => setEvents(data))
    });
        console.log("DATOS", auction)
    }, []);


    useEffect(() => {
      const obtenerBids = async () => {
        await getFromApi(`bids/auction/${auctionId}/`)
        .then((response) => response.json())
        .then((data) => {
          setBids(data)});
        }

        obtenerBids();
  
        // Configurar llamada periódica cada 5 segundos
        const intervalo = setInterval(obtenerBids, 5000);
        
        // Limpiar el intervalo cuando el componente se desmonte
        return () => clearInterval(intervalo);
    }, [auctionId]);


// Función para formatear números con ceros a la izquierda
  const formatearNumero = (num) => {
    return num.toString().padStart(2, '0');
  };

  // Calcular el tiempo restante y actualizar la barra de progreso
  useEffect(() => {
    const calcularTiempoRestante = () => {
      const ahora = new Date();
      const inicio = new Date(auction.starting_date);
      const fin = new Date(auction.end_date);
      
      // Si la fecha de inicio es futura, mostramos una barra completamente verde
      if (ahora < inicio) {
        setTiempoRestante({
          porcentaje: 0,
          color: "bg-green-500",
          dias: Math.ceil((fin - inicio) / (1000 * 60 * 60 * 24)),
          horas: 0,
          minutos: 0,
          segundos: 0,
          texto: "No iniciado",
          formatoTiempo: ""
        });
        return;
      }
      
      // Si la fecha final ya pasó, mostramos una barra completamente roja
      if (ahora > fin) {
        setTiempoRestante({
          porcentaje: 100,
          color: "bg-red-600",
          dias: 0,
          horas: 0,
          minutos: 0,
          segundos: 0,
          texto: "Vencido",
          formatoTiempo: ""
        });
        return;
      }
      
      // Calculamos el tiempo total del proyecto y el tiempo transcurrido
      const tiempoTotal = fin - inicio;
      const tiempoTranscurrido = ahora - inicio;
      
      // Calculamos el porcentaje de tiempo transcurrido
      const porcentajeTranscurrido = (tiempoTranscurrido / tiempoTotal) * 100;
      const porcentajeRedondeado = Math.min(100, Math.max(0, Math.round(porcentajeTranscurrido)));
      
      // Calculamos el tiempo restante en milisegundos
      const msRestantes = fin - ahora;
      
      // Convertimos a diferentes unidades de tiempo
      const segundosRestantes = Math.floor(msRestantes / 1000);
      const minutosRestantes = Math.floor(segundosRestantes / 60);
      const horasRestantes = Math.floor(minutosRestantes / 60);
      const diasRestantes = Math.floor(horasRestantes / 24);
      
      // Calculamos valores para mostrar
      const segundosMostrar = segundosRestantes % 60;
      const minutosMostrar = minutosRestantes % 60;
      const horasMostrar = horasRestantes % 24;
      
      // Determinamos el color basado en el porcentaje (verde -> amarillo -> rojo)
      let color;
      if (porcentajeRedondeado < 50) {
        color = "bg-green-500";
      } else if (porcentajeRedondeado < 65) {
        color = "bg-yellow-500";
      } else if (porcentajeRedondeado < 85) {
        color = "bg-orange-500";
      } else {
        color = "bg-red-600";
      }
      
      // Texto descriptivo según el tiempo restante
      let texto;
      let formatoTiempo = "";
      
      if (horasRestantes >= 24) {
        // Más de un día
        if (diasRestantes === 1) {
          texto = "1 día restante";
        } else {
          texto = `${diasRestantes} días restantes`;
        }
      } else if (horasRestantes >= 1) {
        // Más de una hora pero menos de un día
        texto = "Pocas horas";
        formatoTiempo = `${formatearNumero(horasMostrar)}:${formatearNumero(minutosMostrar)}`;
      } else {
        // Menos de una hora
        texto = "¡Tiempo crítico!";
        formatoTiempo = `${formatearNumero(minutosMostrar)}:${formatearNumero(segundosMostrar)}`;
      }
      
      setTiempoRestante({
        porcentaje: porcentajeRedondeado,
        color,
        dias: diasRestantes,
        horas: horasMostrar,
        minutos: minutosMostrar,
        segundos: segundosMostrar,
        texto,
        formatoTiempo
      });
    };
    
    // Calcular inicialmente
    calcularTiempoRestante();
    
    // Actualizar cada segundo si queda menos de una hora, o cada minuto si queda más
    const intervalo = setInterval(calcularTiempoRestante, 
      tiempoRestante.horas < 1 ? 1000 : 60000);
    
    return () => clearInterval(intervalo);
  }, [auction.starting_date, auction.end_date, tiempoRestante.horas]);


  const handleFormChange = (e) => {
    const { name, value } = e.target;

    if (name === "platform") {
      if (value) {
        setClaveSeleccionada(value);
        const subClavesDisponibles = Object.values(events[value]);
        console.log(events[value])
        setSubClaves(subClavesDisponibles);
        
        setFormulario({
          ...formulario,
          ["platform"]: value,
          ["event"]: subClavesDisponibles[0].titulo
        });
      } else {
        setSubClaves([]);
      }
    } else {
      setFormulario({
        ...formulario,
        [name]: value
      });
    }
    console.log(formulario)
  };
  const [formulario, setFormulario] = useState({
    quantity: "",
    platform: "", 
    event: "",
    auction: 353817,
    client: 588662,
  });

  // Manejador de envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("Enviando datos:", formulario);
        try {
            await postToApi("bids/create/", {
            event: formulario.event,
            platform: formulario.platform,
            quantity: formulario.quantity,
            auction: formulario.auction,
            client: formulario.client,
            });
              setError("")
              setCreateSuccess(true);
              setTimeout(() => {
                setCreateSuccess(false);
              }, 3000);
              setFormulario({
                ...formulario,
                ["quantity"]: ""
              });
                
        // Opcional: redirigir después de crear el servicio
        // setTimeout(() => navigate('/services'), 2000);
        }catch (error) {
            setError(error.message)
            console.error("Error en el submit:", error.message);
        }
  };

  // Formatear fecha para mostrar
  const formatearFecha = (fechaStr) => {
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Detalles del objeto principal - Parte superior */}
      <div className="bg-white shadow-md rounded-md p-6 m-4">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Pujando por:</h1>
            <p className="text-gray-600 mt-2">{service.name}</p>
          </div>
        </div>
        
        {/* Barra de tiempo restante */}
        <div className="mt-6 mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span>Inicio: {formatearFecha(auction.starting_date)}</span>
            <div className="font-medium text-center" style={{ color: tiempoRestante.dias < 1 ? '#e53e3e' : '#2f855a' }}>
              <span>{tiempoRestante.texto}</span>
              {tiempoRestante.formatoTiempo && (
                <div className="text-lg font-bold">
                  {tiempoRestante.formatoTiempo}
                  <span className="text-xs ml-1">
                    {tiempoRestante.horas >= 1 ? 'hh:mm' : 'mm:ss'}
                  </span>
                </div>
              )}
            </div>
            <span>Fin: {formatearFecha(auction.end_date)}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div 
              className={`${tiempoRestante.color} h-4 rounded-full transition-all duration-500 ease-in-out`} 
              style={{ width: `${tiempoRestante.porcentaje}%` }}>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-cyan-50 p-3 rounded-md">
            <span className="text-gray-500 text-sm">Periodo</span>
            <p className="font-medium">
              {formatearFecha(auction.starting_date)} - {formatearFecha(auction.end_date)}
            </p>
          </div>
          <div className="bg-cyan-50 p-3 rounded-md">
            <span className="text-gray-500 text-sm">Puja mínima</span>
            <p className="font-medium">{auction.starting_bid}€</p>
          </div>
          <div className="bg-cyan-50 p-3 rounded-md">
            <span className="text-gray-500 text-sm">Tiempo de control</span>
            <p className="font-medium">{auction.time_frame} minutos</p>
          </div>
          </div>
      </div>
    
          {/* Lista de objetos - Parte media */}
          <div className="bg-white shadow-md rounded-md p-6 m-4 flex-grow">
            <h2 className="text-xl font-semibold mb-4">Pujas realizadas</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-cyan-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Evento</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plataforma</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  { bids.length===0 ? (
                    <p>Todavía no hay pujas.</p>
                  ):(
                    <div className="flex flex-col" style={{ width: "100%" }}>
                        {bids.map((objeto) => (
                            <tr key={objeto.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{objeto.event}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{objeto.platform}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{objeto.quantity}</td>
                            </tr>
                        ))}
                        </div>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        {createSuccess && (
          <div className="flex justify-center">
            <FormContainer role="alert" className="border-2 border-cyan-300 w-11/12 bg-white">
                <strong className="font-bold">Éxito!</strong>
                <span className="block sm:inline">
                  {" "}
                  Se ha realizado la puja correctamente.
                </span>
            </FormContainer>
          </div>
        )}
          {/* Formulario estático - Parte inferior */}
          {user.rol === "client" && <div className="bg-white shadow-md rounded-md p-6 m-4">
            <h2 className="text-xl font-semibold mb-4">Realizar una puja</h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                    Puja
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={formulario.quantity}
                    onChange={handleFormChange}
                    className="focus:ring-cyan-500 focus:border-cyan-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border"
                    placeholder="Ingrese la puja a realizar"
                    required
                    disabled= {tiempoRestante.porcentaje === 100}
                  />
                </div>
                
                <div>
                  <label htmlFor="platform" className="block text-sm font-medium text-gray-700 mb-1">
                    Plataforma
                  </label>
                  <select
                    id="platform"
                    name="platform"
                    disabled= {tiempoRestante.porcentaje === 100}
                    value={formulario.platform || ""}
                    placeholder="-"
                    onChange={handleFormChange}
                    className="focus:ring-cyan-500 focus:border-cyan-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border"
                  >
                    <option value="" disabled>Selecciona una plataforma</option>
                    {Object.keys(events).map((clave) => (
                        <option value={clave.toString()}>{clave}</option>
                    ))}
                  </select>
                </div>
                
                <div className="md:col-span-2">
                  <label htmlFor="event" className="block text-sm font-medium text-gray-700 mb-1">
                    Evento
                  </label>
                  <select
                    id="event"
                    name="event"
                    disabled= {tiempoRestante.porcentaje === 100 || claveSeleccionada === ""}
                    value={formulario.event}
                    onChange={handleFormChange}
                    className="focus:ring-cyan-500 focus:border-cyan-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border"
                  >
                    <option value="" disabled>Selecciona un evento</option>
                    {subClaves.map((event) => (
                        <option value={event.titulo}>{event.hora}-{event.titulo}</option>
                    ))}
                  </select>
                </div>
              </div>
              {error !== "" && (
                <div className="flex justify-center">
                  <FormContainer role="alert" className="border-2 border-red-300 w-11/12">
                      <strong className="font-bold">Ups.. </strong>
                      <span className="block sm:inline">
                        {error}
                      </span>
                  </FormContainer>
                </div>
              )}
              
              <div className="flex justify-end mt-6">
                <button
                  type="button"
                  disabled= {tiempoRestante.porcentaje === 100}
                  className={`py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium${
                    tiempoRestante.porcentaje === 100 ? 
                    "text-white bg-gray-400  mr-3" : 
                    "text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 mr-3"}`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled= {tiempoRestante.porcentaje === 100}
                  className={`py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium${
                    tiempoRestante.porcentaje === 100 ? 
                    "text-white bg-gray-400":
                    "text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"}`}
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>}
        </div>
      );
}

export default AuctionDetail;