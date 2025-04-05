// src/components/scheduling/ServicePricingTab.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { format, parseISO } from 'date-fns';
import { deleteFromApi, postToApi, putToApi } from '../../utils/functions/api';
import { MdDeleteForever, MdOutlineModeEdit } from 'react-icons/md';

const ServicePricingTab = ({ 
  services, 
  timeSlots, 
  weeklySchedules, 
  specificSchedules, 
  servicePricing,
  onAdd,
  onUpdate,
  onDelete
}) => {
  console.log(servicePricing)
  const [selectedPricing, setSelectedPricing] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  
  const [newPricing, setNewPricing] = useState({
    service: '',
    time_slot: '',
    price: 0,
    bookable: true,
  });

  const handlePricingChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (isEditing) {
      setSelectedPricing({
        ...selectedPricing,
        [name]: type === 'checkbox' 
          ? checked 
          : ['price'].includes(name) 
            ? parseFloat(value) 
            : value
      });
    } else {
      setNewPricing({
        ...newPricing,
        [name]: type === 'checkbox' 
          ? checked 
          : ['price'].includes(name) 
            ? parseFloat(value) 
            : value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing && selectedPricing) {
        const response = await putToApi(
          `services/service-prices/${selectedPricing.id}/`, 
          selectedPricing
        );
        onUpdate(response.data);
        setSelectedPricing(null);
        setIsEditing(false);
      } else {
        console.log(newPricing)
        const response = await postToApi('services/service-prices/', newPricing);
        onAdd(response.data);
        setNewPricing({
          service: '',
          time_slot: '',
          price: 0,
          bookable: true,
        });
      }
    } catch (error) {
      console.error('Error saving service pricing:', error);
    }
  };

  const handleEdit = (pricing) => {
    setSelectedPricing(pricing);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setSelectedPricing(null);
    setIsEditing(false);
  };

  const handleDelete = async (id) => {
    try {
      await deleteFromApi(`services/service-prices/${id}/`);
      onDelete(id);
    } catch (error) {
      console.error('Error deleting service pricing:', error);
    }
  };

  // Function to get service pricing details
  const getServicePricingDetails = (pricingId) => {
    const pricing = servicePricing.find(a => a.id === pricingId);
    if (!pricing) return null;

    return {
      pricing,
      service: pricing.service_details.name,
      timeSlot: pricing.time_slot_details.name,
      schedule: pricing.time_slot_details.schedule_type.name,
      price: `$${pricing.price}`
    };
  };

  
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-white">Precios de los Servicios</h2>
      
      {/* Service Pricing Form */}
      <div className="bg-white p-4 shadow rounded mb-6">
        <h3 className="text-lg font-medium mb-3">
          {isEditing ? 'Editar Precio de Servicio' : 'Crear Precio de Servicio'}
        </h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Servicio</label>
            <select
              name="service"
              value={isEditing ? selectedPricing.service : newPricing.service}
              onChange={handlePricingChange}
              className="w-full p-2 border rounded"
              required
            >
              <option value="">Selecciona un servicio</option>
              {services?.map(service => (
                <option key={service.id} value={service.id}>{service.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Slot Assignment</label>
            <select
              name="time_slot"
              value={isEditing ? selectedPricing.time_slot : newPricing.time_slot}
              onChange={handlePricingChange}
              className="w-full p-2 border rounded"
              required
              disabled={isEditing}
            >
              <option value="">Select a slot assignment</option>
              {/* Weekly schedules */}
              <optgroup label="Weekly Schedules">
                {weeklySchedules?.flatMap(schedule => 
                  schedule.assignments?.map(assignment => {
                    const slot = timeSlots.find(s => s.id === assignment.time_slot);
                    return slot ? (
                      <option key={`weekly-${assignment.id}`} value={assignment.id}>
                        {schedule.name} - {slot.name} ({slot.start_time}-{slot.end_time})
                      </option>
                    ) : null;
                  }) || []
                )}
              </optgroup>
              
              {/* Specific schedules */}
              <optgroup label="Specific Date Schedules">
                {specificSchedules?.flatMap(schedule => 
                  schedule.assignments?.map(assignment => {
                    const slot = timeSlots.find(s => s.id === assignment.time_slot);
                    return slot ? (
                      <option key={`specific-${assignment.id}`} value={assignment.id}>
                        {format(parseISO(schedule.date), 'yyyy-MM-dd')} - {slot.name} ({slot.start_time}-{slot.end_time})
                      </option>
                    ) : null;
                  }) || []
                )}
              </optgroup>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Precio</label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">€</span>
              <input
                type="number"
                name="price"
                min="0"
                step="0.01"
                value={isEditing ? selectedPricing.price : newPricing.price}
                onChange={handlePricingChange}
                className="w-full p-2 pl-6 border rounded"
                required
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="bookable"
              checked={isEditing ? selectedPricing.active : newPricing.bookable}
              onChange={handlePricingChange}
              className="mr-2"
            />
            <label className="text-sm font-medium">Reservable</label>
          </div>
          
          <div className="md:col-span-2 flex gap-2">
            <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
              {isEditing ? 'Update Service Price' : 'Add Service Price'}
            </button>
            
            {isEditing && (
              <button 
                type="button"
                onClick={handleCancelEdit}
                className="bg-gray-300 text-gray-800 py-2 px-4 rounded hover:bg-gray-400"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>
      
      {/* Service Pricing List */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow rounded">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-2 px-4 text-left">Servicio</th>
              <th className="py-2 px-4 text-left">Turno</th>
              <th className="py-2 px-4 text-left">Horario</th>
              <th className="py-2 px-4 text-left">Precio</th>
              <th className="py-2 px-4 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {servicePricing && servicePricing.map((pricing) => {
              const details = getServicePricingDetails(pricing.id);
              if (!details) return null;
              
              return (
                <tr key={pricing.id} className="border-t">
                  <td className="py-2 px-4">{details.service}</td>
                  <td className="py-2 px-4">{details.timeSlot}</td>
                  <td className="py-2 px-4">{details.schedule}</td>
                  <td className="py-2 px-4 font-medium">{details.price}</td>
                  <td className="py-2 px-4">
                    <button 
                      onClick={() => handleEdit(pricing)}
                      className="text-blue-500 hover:text-blue-700 mr-2"
                    >
                      <MdOutlineModeEdit />
                    </button>
                    <button 
                      onClick={() => handleDelete(pricing.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <MdDeleteForever />
                    </button>
                  </td>
                </tr>
              );
            })}
            {!servicePricing && (
              <tr>
                <td colSpan="7" className="py-4 px-4 text-center text-gray-500">
                  No hay precios para servicios creados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ServicePricingTab;