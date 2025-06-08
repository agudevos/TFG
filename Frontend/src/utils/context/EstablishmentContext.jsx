import React, { useCallback, useContext, useMemo, useState } from 'react'
import { createContext } from 'react'

const EstablishmentContext = createContext()

export default EstablishmentContext;

export const useEstablishment = () => {
  const context = useContext(EstablishmentContext);
  if (!context) {
    throw new Error('useEstablishment must be used within a EstablishmentProvider');
  }
  return context;
};

export function EstablishmentProvider( {children} ) {
    const [selectedEstablishment, setSelectedEstablishment] = useState(() =>
    localStorage.getItem('selectedEstablishment') ? JSON.parse(localStorage.getItem('selectedEstablishment')) : [])

    const saveSelectedEstablishment = useCallback((establishment) => {
        localStorage.setItem('selectedEstablishment', JSON.stringify(establishment));
        setSelectedEstablishment(establishment);
    }, [])    

    const clearSelection = () => {
    setSelectedEstablishment(null);
    try {
      localStorage.removeItem('selectedEstablishmentId');
    } catch (error) {
      console.error('Error removing establishment from localStorage:', error);
    }
    
  };
    return (
    <EstablishmentContext.Provider value={useMemo(() => ({selectedEstablishment, setSelectedEstablishment, saveSelectedEstablishment, clearSelection}), [selectedEstablishment, saveSelectedEstablishment, saveSelectedEstablishment, clearSelection])} >
        {children}
    </EstablishmentContext.Provider>
  )
}
