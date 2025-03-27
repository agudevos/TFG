import { Link, Navigate } from "react-router-dom";
import { Button, Flex } from "@radix-ui/themes";
import { useContext } from "react";
import { IoTv, IoStatsChart, IoCalendarSharp } from "react-icons/io5";


function App() {
    return (
        <>
          <Flex justify="center" align="center">
            <div className="mt-6 flex items-center">
              <img src="/pwa-64x64.png" alt="Logo" className="mr-4" />
              <h1 className="text-2xl font-bold">UChoose</h1>
            </div>
          </Flex>
          <Flex direction="column" justify="center" align="center">
            <Link to="/login">
              <Button size="4" variant="classic" color="green">
                Iniciar Sesión
              </Button>
            </Link>
            <div className="md:mt-8 m-5 grid grid-row-3 md:grid-cols-3 gap-8">
                  <div className="flex flex-col items-center">
                    <IoStatsChart className="h-16 w-16 text-blue-300" />
                    <span className="mt-2 text-lg font-semibold">Estadísticas de Rendimiento</span>
                    <p className="text-center text-sm text-gray-600 mt-1">
                      Lleva un seguimiento del rendimiento de tus servicios y recibe recomendaciones para mejorar su desempeño.
                    </p>
                  </div>
                  <div className="flex flex-col items-center">
                    <IoTv className="h-16 w-16 text-blue-300" />
                    <span className="mt-2 text-lg font-semibold">Subastas de decisión multimedia</span>
                    <p className="text-center text-sm text-gray-600 mt-1">
                    Pon tus pantallas multimedia de tus establecimiento en subasta para que tus clientes elijan que quieren ver .
                    </p>
                  </div>
                  <div className="flex flex-col items-center">
                    <IoCalendarSharp className="h-16 w-16 text-blue-300" />
                    <span className="mt-2 text-lg font-semibold">Gestión de Reservas</span>
                    <p className="text-center text-sm text-gray-600 mt-1">
                      Si eres propietario de un establecimiento, registrate y administra el control de las reservas y obten un 100% de adaptación de la disponibilidad de reserva.
                    </p>
                  </div>
                </div>
          </Flex>
        </>
      );
    }
    
    export default App;