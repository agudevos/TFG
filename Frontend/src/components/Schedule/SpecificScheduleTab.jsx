// src/components/scheduling/SpecificScheduleTab.jsx
import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';
import SlotAssignmentModal from './SlotAssignmentModal';
import { MdDeleteForever, MdOutlineDeleteForever, MdOutlineModeEdit } from 'react-icons/md';
import { deleteFromApi, getFromApi, postToApi, putToApi } from '../../utils/functions/api';

const SpecificScheduleTab = ({ 
  specificSchedules, 
  timeSlots, 
  onAdd, 
  onUpdate, 
  onDelete 
}) => {
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    name: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    active: true
  });

  const handleScheduleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (isEditing) {
      setSelectedSchedule({
        ...selectedSchedule,
        [name]: type === 'checkbox' ? checked : value
      });
    } else {
      setNewSchedule({
        ...newSchedule,
        [name]: type === 'checkbox' ? checked : value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        const response = await putToApi(`schedules/specific-schedules/${selectedSchedule.id}/`, selectedSchedule);
        onUpdate(response.data);
        setSelectedSchedule(null);
        setIsEditing(false);
      } else {
        const response = await postToApi('schedules/specific-schedules/', newSchedule);
        onAdd(response.data);
        setNewSchedule({
          name: '',
          date: format(new Date(), 'yyyy-MM-dd'),
          active: true
        });
      }
    } catch (error) {
      console.error('Error saving specific schedule:', error);
    }
  };

  const handleEdit = (schedule) => {
    setSelectedSchedule(schedule);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setSelectedSchedule(null);
    setIsEditing(false);
  };

  const handleDelete = async (id) => {
    try {
      await deleteFromApi(`schedules/specific-schedules/${id}/`);
      onDelete(id);
    } catch (error) {
      console.error('Error deleting specific schedule:', error);
    }
  };

  const handleAddTimeSlot = async (slotData) => {
    try {
      const data = {
        ...slotData,
        specific_schedule: selectedSchedule.id,
        weekly_schedule: null,
      }
      console.log(data)
      const response = await postToApi('schedules/slot-assignments/', data);
      console.log("RESPONSE", response)
      
      // Refresh the schedule with the new slot assignment
      const updatedScheduleResponse = await getFromApi(`schedules/specific-schedules/${selectedSchedule.id}/`);
      onUpdate(updatedScheduleResponse.data);
    } catch (error) {
      console.error('Error assigning slot to schedule:', error);
    }
  };

  const handleEditSlots = (schedule) => {
    setSelectedSchedule(schedule);
    setIsEditing(false);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-white">Horarios para días especificos</h2>
      
      {/* Specific Schedule Form */}
      <div className="bg-white p-4 shadow rounded mb-6">
        <h3 className="text-lg font-medium mb-3">
          {isEditing ? 'Editar Horario Especial' : 'Crear Horario Especial'}
        </h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nombre</label>
            <input
              type="text"
              name="name"
              value={isEditing ? selectedSchedule.name : newSchedule.name}
              onChange={handleScheduleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Fecha</label>
            <input
              type="date"
              name="date"
              value={isEditing ? selectedSchedule.date : newSchedule.date}
              onChange={handleScheduleChange}
              className="w-full p-2 border rounded"
              required
              disabled={isEditing}
            />
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              name="active"
              checked={isEditing ? selectedSchedule.active : newSchedule.active}
              onChange={handleScheduleChange}
              className="mr-2"
            />
            <label className="text-sm font-medium">Activo</label>
          </div>
          
          <div className="md:col-span-2 flex gap-2">
            <button 
              type="submit" 
              className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
            >
              {isEditing ? 'Actualizar Horario' : 'Crear Horario'}
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
      
      {/* Specific Schedules List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {specificSchedules && specificSchedules.map((schedule) => (
          <div key={schedule.id} className="bg-white p-4 shadow rounded">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">
                {schedule.name} ({format(parseISO(schedule.date), 'MMM d, yyyy')})
              </h3>
              <div className="flex space-x-2">
                <button 
                  onClick={() => handleEdit(schedule)}
                  className="text-blue-500 hover:text-blue-700"
                >
                  <MdOutlineModeEdit />
                </button>
                <button 
                  onClick={() => handleEditSlots(schedule)}
                  className="text-green-500 hover:text-green-700"
                >
                  Turnos
                </button>
                <button 
                  onClick={() => handleDelete(schedule.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <MdDeleteForever />
                </button>
              </div>
            </div>
            
            <div className="flex items-center mb-2">
              <span className={`inline-block w-3 h-3 rounded-full mr-2 ${schedule.active ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <span className="text-sm">{schedule.active ? 'Active' : 'Inactive'}</span>
            </div>
            
            {/* Time Slots for this specific schedule */}
            <h4 className="font-medium mb-2 mt-4">Turnos:</h4>
            <ul className="space-y-2">
              {schedule.assignments && schedule.assignments.length > 0 ? (
                schedule.assignments.map((assignment) => {
                  const slot = timeSlots.find(s => s.id === assignment.time_slot);
                  return slot ? (
                    <li key={assignment.id} className="flex items-center">
                      <div className="w-4 h-4 rounded mr-2" style={{ backgroundColor: slot.color }}></div>
                      <span>
                        {slot.name} ({slot.start_time} - {slot.end_time})
                        {assignment.notes && <span className="text-gray-500 text-sm ml-1">- {assignment.notes}</span>}
                      </span>
                    </li>
                  ) : null;
                })
              ) : (
                <li className="text-gray-500">Sin turnos asignados</li>
              )}
            </ul>
          </div>
        ))}
        
        {!specificSchedules && (
          <div className="md:col-span-2 bg-white p-4 shadow rounded text-center text-gray-500">
            No hay horarios especiales creados
          </div>
        )}
      </div>
      
      {/* Slot Assignment Modal */}
      {selectedSchedule && !isEditing && (
        <SlotAssignmentModal
          schedule={selectedSchedule}
          scheduleType="specific"
          timeSlots={timeSlots}
          onClose={() => setSelectedSchedule(null)}
          onSubmit={handleAddTimeSlot}
        />
      )}
    </div>
  );
};

export default SpecificScheduleTab;