import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getFromApi } from '../../utils/functions/api';
import { FaDollarSign } from 'react-icons/fa';
import { RiAuctionFill } from "react-icons/ri";
import { BiDonateHeart } from "react-icons/bi";

const EstablishmentStats = () => {
  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEstadisticas = async () => {
      try {
        await getFromApi("establishments/stadistics/862691/")
        .then((response) => response.json())
        .then((data) => setEstadisticas(data))
      } catch (err) {
        setError('Error al cargar las estadísticas');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEstadisticas();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg text-red-500">
        {error}
      </div>
    );
  }
// Verificar si estadisticas existe antes de usarlo
if (!estadisticas) {
    return (
      <div className="bg-yellow-50 p-3 sm:p-4 rounded-lg text-xs sm:text-sm text-yellow-600">
        No hay datos disponibles
      </div>
    );
  }

  // Asegurarse de que estadisticas y por_plataforma existen antes de mapear
  const chartData = estadisticas.por_plataforma ? estadisticas.por_plataforma.map(item => ({
    name: item.platform,
    'Puja Inicial Media': item.starting_bid_media,
    'Puja Ganadora Media': item.quantity_media,
    'Total Subastas': item.cantidad_subastas
  })) : [];

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden w-full ">
      {/* Header */}
      <div className="bg-cyan-500 px-4 sm:px-6 py-3 sm:py-4 text-white">
        <h2 className="text-lg sm:text-xl font-semibold">Estadísticas de Subastas</h2>
      </div>
      
      {/* Estadísticas generales */}
      <div className="p-4 sm:p-6">
        {estadisticas.general && (
          <>
            <h3 className="text-lg font-medium text-gray-800 mb-4">Resumen General</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
              {/* Card 1 */}
              <div className="bg-white rounded-lg shadow p-3 sm:p-4 border-l-4 border-cyan-500">
                <div className="flex items-center">
                  <div className="bg-cyan-100 p-2 sm:p-3 rounded-full">
                    <FaDollarSign size={20} className="text-cyan-500" />
                  </div>
                  <div className="ml-3 sm:ml-4">
                    <p className="text-xs sm:text-sm text-gray-500">Puja Inicial Media</p>
                    <p className="text-lg sm:text-xl font-semibold text-gray-700">
                      {estadisticas.general.starting_bid_media.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Card 2 */}
              <div className="bg-white rounded-lg shadow p-3 sm:p-4 border-l-4 border-cyan-500">
                <div className="flex items-center">
                  <div className="bg-cyan-100 p-2 sm:p-3 rounded-full">
                    <BiDonateHeart size={20} className="text-cyan-500" />
                  </div>
                  <div className="ml-3 sm:ml-4">
                    <p className="text-xs sm:text-sm text-gray-500">Puja Ganadora Media</p>
                    <p className="text-lg sm:text-xl font-semibold text-gray-700">
                      {estadisticas.general.quantity_media.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Card 3 */}
              <div className="bg-white rounded-lg shadow p-3 sm:p-4 border-l-4 border-cyan-500">
                <div className="flex items-center">
                  <div className="bg-cyan-100 p-2 sm:p-3 rounded-full">
                    <RiAuctionFill size={20} className="text-cyan-500" />
                  </div>
                  <div className="ml-3 sm:ml-4">
                    <p className="text-xs sm:text-sm text-gray-500">Total Subastas</p>
                    <p className="text-lg sm:text-xl font-semibold text-gray-700">
                      {estadisticas.general.total_subastas}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
        
         {/* Gráfico */}
        {estadisticas.por_plataforma && estadisticas.por_plataforma.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-3 sm:mb-4">Estadísticas por Plataforma</h3>
            
            <div className="h-48 sm:h-56 md:h-64 mb-4 sm:mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 5, right: 5, left: 0, bottom: 40 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    tick={{fontSize: 11}} 
                    height={50}
                    angle={-45} 
                    textAnchor="end"
                    dy={10}
                  />
                  <YAxis tick={{fontSize: 11}} width={40} />
                  <Tooltip contentStyle={{fontSize: 12}} />
                  <Legend 
                    wrapperStyle={{fontSize: 12, paddingTop: 15, paddingBottom: 35}}
                    verticalAlign="top"
                    height={36}
                  />
                  <Bar margin={{bottom:5}} dataKey="Puja Inicial Media" fill="#0ea5e9" />
                  <Bar dataKey="Puja Ganadora Media" fill="#33ffb8" />
                  <Bar dataKey="Total Subastas" fill="#ce33ff" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Tabla */}
            <div className="overflow-x-auto mt-3 sm:mt-4">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-2 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plataforma</th>
                    <th className="px-2 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
                    <th className="px-2 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Puja Media</th>
                    <th className="px-2 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Puja Ganadora Media</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {estadisticas.por_plataforma.map((item, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-2 py-2 sm:px-4 sm:py-3 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">{item.platform}</td>
                      <td className="px-2 py-2 sm:px-4 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-gray-500">{item.cantidad_subastas}</td>
                      <td className="px-2 py-2 sm:px-4 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                        {item.starting_bid_media.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-2 py-2 sm:px-4 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                        {item.quantity_media.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default EstablishmentStats;