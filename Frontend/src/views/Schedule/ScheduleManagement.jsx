import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TimeSlotTab from '../../components/Schedule/TimeSlotTab';
import WeeklyScheduleTab from '../../components/Schedule/WeeklyScheduleTab';
import SpecificScheduleTab from '../../components/Schedule/SpecificScheduleTab';
import ServicePricingTab from '../../components/Schedule/ServicePricingTab';
import { getFromApi } from '../../utils/functions/api.js'

const ScheduleManagement = () => {
  // State for all data
  const [services, setServices] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [weeklySchedules, setWeeklySchedules] = useState([]);
  const [specificSchedules, setSpecificSchedules] = useState([]);
  const [servicePricing, setServicePricing] = useState([]);
  const [activeTab, setActiveTab] = useState('timeSlots');

  // Fetch data on component mount
 useEffect(() => {
    const fetchData = async () => {
      try {
        await getFromApi("schedules/time-slots/")
        .then((response) => response.json())
        .then((data) => {
          setTimeSlots(data)});
        await getFromApi("schedules/weekly-schedules/")
        .then((response) => response.json())
        .then((data) => {
          setWeeklySchedules(data)});
        await getFromApi("schedules/specific-schedules/")
        .then((response) => response.json())
        .then((data) => {
          setSpecificSchedules(data)});
        await getFromApi(`services/establishment/${862691}/`)
        .then((response) => response.json())
        .then((data) => {
          setServices(data)});
        await getFromApi(`services/service-prices/`)
        .then((response) => response.json())
        .then((data) => {
          console.log(data)
          setServicePricing(data)});
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);


  // Functions for updating data
  const addTimeSlot = (newTimeSlot) => {
    setTimeSlots([...timeSlots, newTimeSlot]);
  };

  const updateTimeSlot = (updatedTimeSlot) => {
    setTimeSlots(timeSlots.map(slot => 
      slot.id === updatedTimeSlot.id ? updatedTimeSlot : slot
    ));
  };

  const deleteTimeSlot = (id) => {
    setTimeSlots(timeSlots.filter(slot => slot.id !== id));
  };

  const addWeeklySchedule = (newSchedule) => {
    setWeeklySchedules([...weeklySchedules, newSchedule]);
  };

  const updateWeeklySchedule = (updatedSchedule) => {
    setWeeklySchedules(weeklySchedules.map(schedule => 
      schedule.id === updatedSchedule.id ? updatedSchedule : schedule
    ));
  };

  const deleteWeeklySchedule = (id) => {
    setWeeklySchedules(weeklySchedules.filter(schedule => schedule.id !== id));
  };

  const addSpecificSchedule = (newSchedule) => {
    setSpecificSchedules([...specificSchedules, newSchedule]);
  };

  const updateSpecificSchedule = (updatedSchedule) => {
    setSpecificSchedules(specificSchedules.map(schedule => 
      schedule.id === updatedSchedule.id ? updatedSchedule : schedule
    ));
  };

  const deleteSpecificSchedule = (id) => {
    setSpecificSchedules(specificSchedules.filter(schedule => schedule.id !== id));
  };

  const addServicePricing = (newPricing) => {
    setServicePricing([...servicePricing, newPricing]);
  };

  const updateServicePricing = (updatedPricing) => {
    setServicePricing(servicePricing.map(pricing => 
      pricing.id === updatedPricing.id ? updatedPricing : pricing
    ));
  };

  const deleteServicePricing = (id) => {
    setServicePricing(servicePricing.filter(pricing => pricing.id !== id));
  };

  return (
    <div className="p-4 mx-auto max-w-6xl">
      <div className='bg-white p-4 shadow rounded mb-6'>
        <h1 className="text-2xl font-bold mb-6">Gestión de Horarios</h1>
        
        {/* Tab navigation */}
        <div className="border-b mb-4">
          <nav className="flex gap-4">
            <button 
              className={`py-2 px-4 ${activeTab === 'timeSlots' ? 'border-b-2 border-blue-500 font-semibold' : ''}`}
              onClick={() => setActiveTab('timeSlots')}
            >
              Turnos
            </button>
            <button 
              className={`py-2 px-4 ${activeTab === 'weeklySchedules' ? 'border-b-2 border-blue-500 font-semibold' : ''}`}
              onClick={() => setActiveTab('weeklySchedules')}
            >
              Horarios Semanales
            </button>
            <button 
              className={`py-2 px-4 ${activeTab === 'specificSchedules' ? 'border-b-2 border-blue-500 font-semibold' : ''}`}
              onClick={() => setActiveTab('specificSchedules')}
            >
              Horario Día Especifico
            </button>
            <button 
              className={`py-2 px-4 ${activeTab === 'servicePricing' ? 'border-b-2 border-blue-500 font-semibold' : ''}`}
              onClick={() => setActiveTab('servicePricing')}
            >
              Gestión de Precios
            </button>
          </nav>
        </div>
        </div>
      
      {/* Tab Content */}
      {activeTab === 'timeSlots' && (
        <TimeSlotTab 
          timeSlots={timeSlots} 
          onAdd={addTimeSlot}
          onUpdate={updateTimeSlot}
          onDelete={deleteTimeSlot}
        />
      )}
      
      {activeTab === 'weeklySchedules' && (
        <WeeklyScheduleTab 
          weeklySchedules={weeklySchedules}
          timeSlots={timeSlots}
          onAdd={addWeeklySchedule}
          onUpdate={updateWeeklySchedule}
          onDelete={deleteWeeklySchedule}
          onAddSpecificFromWeekly={addSpecificSchedule}
        />
      )}
      
      {activeTab === 'specificSchedules' && (
        <SpecificScheduleTab 
          specificSchedules={specificSchedules}
          timeSlots={timeSlots}
          onAdd={addSpecificSchedule}
          onUpdate={updateSpecificSchedule}
          onDelete={deleteSpecificSchedule}
        />
      )}
      
      {activeTab === 'servicePricing' && (
        <ServicePricingTab 
          services={services}
          timeSlots={timeSlots}
          weeklySchedules={weeklySchedules}
          specificSchedules={specificSchedules}
          servicePricing={servicePricing}
          onAdd={addServicePricing}
          onUpdate={updateServicePricing}
          onDelete={deleteServicePricing}
        />
      )}
    </div>
  );
};

export default ScheduleManagement;