import React, { useState } from 'react';
import axios from 'axios';
import { deleteFromApi, postToApi, putToApi } from '../../utils/functions/api';
import { MdOutlineModeEdit } from "react-icons/md";
import { MdDeleteForever } from "react-icons/md";

const TimeSlotTab = ({ timeSlots, onAdd, onUpdate, onDelete }) => {
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  
  const [newTimeSlot, setNewTimeSlot] = useState({
    name: '',
    start_time: '09:00',
    end_time: '10:00',
    color: '#3498db',
  });

  const handleTimeSlotChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (isEditing) {
      setSelectedTimeSlot({
        ...selectedTimeSlot,
        [name]: type === 'checkbox' ? checked : value
      });
    } else {
      setNewTimeSlot({
        ...newTimeSlot,
        [name]: type === 'checkbox' ? checked : value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing && selectedTimeSlot) {
        const response = await putToApi(`schedules/time-slots/${selectedTimeSlot.id}/`, selectedTimeSlot);
        onUpdate(response.data);
        setSelectedTimeSlot(null);
        setIsEditing(false);
        window.location.reload(); 
      } else {
        const response = await postToApi('schedules/time-slots/', newTimeSlot);
        onAdd(response.data);
        setNewTimeSlot({
          name: '',
          start_time: '09:00',
          end_time: '10:00',
          color: '#3498db',
        });
        window.location.reload(); 
      }
    } catch (error) {
      console.error('Error saving time slot:', error);
    }
  };

  const handleEdit = (slot) => {
    setSelectedTimeSlot(slot);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setSelectedTimeSlot(null);
    setIsEditing(false);
  };

  const handleDelete = async (id) => {
    try {
      await deleteFromApi(`schedule/time-slots/${id}/`);
      onDelete(id);
    } catch (error) {
      console.error('Error deleting time slot:', error);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-white">Turnos</h2>
      
      {/* Time Slot Form */}
      <div className="bg-white p-4 shadow rounded mb-6">
        <h3 className="text-lg font-medium mb-3">
          {isEditing ? 'Editar Turno' : 'Crear Turno'}
        </h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nombre</label>
            <input
              type="text"
              name="name"
              value={isEditing ? selectedTimeSlot.name : newTimeSlot.name}
              onChange={handleTimeSlotChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Hora de Inicio</label>
            <input
              type="time"
              name="start_time"
              value={isEditing ? selectedTimeSlot.start_time : newTimeSlot.start_time}
              onChange={handleTimeSlotChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Hora de Fin</label>
            <input
              type="time"
              name="end_time"
              value={isEditing ? selectedTimeSlot.end_time : newTimeSlot.end_time}
              onChange={handleTimeSlotChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Color</label>
            <input
              type="color"
              name="color"
              value={isEditing ? selectedTimeSlot.color : newTimeSlot.color}
              onChange={handleTimeSlotChange}
              className="w-full p-2 border rounded h-10"
            />
          </div>
          
          <div className="md:col-span-2 flex gap-2">
            <button 
              type="submit" 
              className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
            >
              {isEditing ? 'Actualizar Turno' : 'Crear Turno'}
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
      
      {/* Time Slots List */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow rounded">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-2 px-4 text-left">Nombre</th>
              <th className="py-2 px-4 text-left">Tiempo</th>
              <th className="py-2 px-4 text-left">Color</th>
              <th className="py-2 px-4 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {timeSlots && timeSlots.map((slot) => (
              <tr key={slot.id} className="border-t">
                <td className="py-2 px-4">{slot.name}</td>
                <td className="py-2 px-4">{slot.start_time} - {slot.end_time}</td>
                <td className="py-2 px-4">
                  <div className="w-6 h-6 rounded" style={{ backgroundColor: slot.color }}></div>
                </td>
                <td className="py-2 px-4">
                  <button 
                    onClick={() => handleEdit(slot)}
                    className="text-blue-500 hover:text-blue-700 mr-2"
                  >
                    <MdOutlineModeEdit />
                  </button>
                  <button 
                    onClick={() => handleDelete(slot.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <MdDeleteForever />
                  </button>
                </td>
              </tr>
            ))}
            {!timeSlots && (
              <tr>
                <td colSpan="6" className="py-4 px-4 text-center text-gray-500">
                  No hay turnos creados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TimeSlotTab;