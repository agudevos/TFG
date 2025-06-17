import { Flex } from "@radix-ui/themes";
import { IoTv, IoStatsChart, IoCalendarSharp } from "react-icons/io5";


function App() {
    return (
        <>
          <Flex direction="column" justify="center" align="center">
            <div className="md:mt-8 m-5 grid grid-cols-1 md:grid-rows-3 gap-10 max-w-7xl mx-auto">
              <div className="flex flex-col items-center bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 border border-gray-100">
                <IoStatsChart className="h-16 w-16 text-cyan-500 mb-3" />
                <span className="text-xl font-bold text-gray-800 mb-2">Estadísticas de Rendimiento</span>
                <p className="text-center text-gray-600">
                  Lleva un seguimiento del rendimiento de tus servicios y recibe recomendaciones para mejorar su desempeño.
                </p>
              </div>
              
              <div className="flex flex-col items-center bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 border border-gray-100">
                <IoTv className="h-16 w-16 text-cyan-500 mb-3" />
                <span className="text-xl font-bold text-gray-800 mb-2">Subastas de decisión multimedia</span>
                <p className="text-center text-gray-600">
                  Pon tus pantallas multimedia de tus establecimiento en subasta para que tus clientes elijan que quieren ver.
                </p>
              </div>
              
              <div className="flex flex-col items-center bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 border border-gray-100">
                <IoCalendarSharp className="h-16 w-16 text-cyan-500 mb-3" />
                <span className="text-xl font-bold text-gray-800 mb-2">Gestión de Reservas</span>
                <p className="text-center text-gray-600">
                  Si eres propietario de un establecimiento, registrate y administra el control de las reservas y obten un 100% de adaptación de la disponibilidad de reserva.
                </p>
              </div>
            </div>
          </Flex>
        </>
      );
    }
    
    export default App;