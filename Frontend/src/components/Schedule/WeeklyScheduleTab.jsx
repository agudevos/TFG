import React, { useState } from 'react';
import SlotAssignmentModal from './SlotAssignmentModal';
import { deleteFromApi, getFromApi, postToApi } from '../../utils/functions/api';
import { MdDeleteForever } from 'react-icons/md';
import { IoMdAddCircleOutline } from "react-icons/io";

const WeeklyScheduleTab = ({ 
  weeklySchedules, 
  timeSlots, 
  onAdd, 
  onUpdate, 
  onDelete,
  onAddSpecificFromWeekly
}) => {
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [newSchedule, setNewSchedule] = useState({
    name: '',
    weekday: 0,
    active: true
  });

  const handleScheduleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewSchedule({
      ...newSchedule,
      [name]: type === 'checkbox' ? checked : name === 'weekday' ? parseInt(value, 10) : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await postToApi('schedules/weekly-schedules/', newSchedule);
      onAdd(response);
      setNewSchedule({
        name: '',
        weekday: 0,
        active: true
      });
    } catch (error) {
      console.error('Error creating weekly schedule:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteFromApi(`schedules/weekly-schedules/${id}/`);
      onDelete(id);
    } catch (error) {
      console.error('Error deleting weekly schedule:', error);
    }
  };

  const handleAddTimeSlot = async (slotData) => {
    try {
      const data = {
        ...slotData,
        weekly_schedule: selectedSchedule.id,
      }
      
      const response = await postToApi('schedules/slot-assignments/', data);
      console.log("RESPONSE", response)
      
      // Refresh the schedule with the new slot assignment
      const updatedScheduleResponse = await getFromApi(`schedules/weekly-schedules/${selectedSchedule.id}/`);
      console.log(updatedScheduleResponse)
      onUpdate(updatedScheduleResponse);
      
    } catch (error) {
      console.error('Error assigning slot to schedule:', error);
    }
  };

  const createSpecificFromWeekly = async (weeklyScheduleId, date, name) => {
    try {
      const response = await postToApi('schedules/specific-schedules/create-from/', {
        template_id: weeklyScheduleId,
        template_type: 'weekly',
        date: date,
        name: name || `Schedule for ${date}`
      });
      
      onAddSpecificFromWeekly(response.data);
    } catch (error) {
      console.error('Error creating specific schedule from template:', error);
    }
  };

  // Utility to get weekday name
  const getWeekdayName = (day) => {
    const weekdays = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    return weekdays[day];
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-white">Horarios Semanales</h2>
      
      {/* Weekly Schedule Form */}
      <div className="bg-white p-4 shadow rounded mb-6">
        <h3 className="text-lg font-medium mb-3">Añadir Horario</h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nombre</label>
            <input
              type="text"
              name="name"
              value={newSchedule.name}
              onChange={handleScheduleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Día de la Semana</label>
            <select
              name="weekday"
              value={newSchedule.weekday}
              onChange={handleScheduleChange}
              className="w-full p-2 border rounded"
              required
            >
              <option value={0}>Lunes</option>
              <option value={1}>Martes</option>
              <option value={2}>Miércoles</option>
              <option value={3}>Jueves</option>
              <option value={4}>Viernes</option>
              <option value={5}>Sábado</option>
              <option value={6}>Domingo</option>
            </select>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              name="active"
              checked={newSchedule.active}
              onChange={handleScheduleChange}
              className="mr-2"
            />
            <label className="text-sm font-medium">Activo</label>
          </div>
          
          <div className="md:col-span-2">
            <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
              Añadir Horario Semanal
            </button>
          </div>
        </form>
      </div>
      
      {/* Weekly Schedules List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {weeklySchedules && weeklySchedules.map((schedule) => (
          <div key={schedule.id} className="bg-white p-4 shadow rounded">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">
                {schedule.name} ({getWeekdayName(schedule.weekday)})
              </h3>
              <div>
                <button 
                  onClick={() => setSelectedSchedule(schedule)}
                  className="text-blue-500 hover:text-blue-700 mr-2"
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
            
            {/* Time Slots for this schedule */}
            <h4 className="font-medium mb-2">Turnos:</h4>
            <ul className="space-y-2 mb-4">
              {schedule.assignments && schedule.assignments.length > 0 ? (
                schedule.assignments.map((assignment) => {
                  const slot = timeSlots.find(s => s.id === assignment.time_slot);
                  return slot ? (
                    <li key={assignment.id} className="flex items-center">
                      <div className="w-4 h-4 rounded mr-2" style={{ backgroundColor: slot.color }}></div>
                      <span>
                        {slot.name} ({slot.start_time} - {slot.end_time})
                        {assignment.notes && ` - ${assignment.notes}`}
                      </span>
                    </li>
                  ) : null;
                })
              ) : (
                <li className="text-gray-500">Sin turnos asignados</li>
              )}
            </ul>
            
            {/* Create Specific Schedule from This Template */}
            <div className="mt-4 pt-4 border-t">
              <h4 className="font-medium mb-2">Crear horario especifico con esta plantilla:</h4>
              <div className="flex items-end gap-2">
                <div>
                  <label className="block text-sm font-medium mb-1">Fecha</label>
                  <input 
                    type="date" 
                    id={`specific-date-${schedule.id}`}
                    className="p-2 border rounded"
                  />
                </div>
                <button
                  onClick={() => {
                    const dateElem = document.getElementById(`specific-date-${schedule.id}`);
                    if (dateElem && dateElem.value) {
                      createSpecificFromWeekly(
                        schedule.id, 
                        dateElem.value, 
                        `${schedule.name} (${dateElem.value})`
                      );
                    }
                  }}
                  className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
                >
                  <IoMdAddCircleOutline />
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {!weeklySchedules && (
          <div className="md:col-span-2 bg-white p-4 shadow rounded text-center text-gray-500">
            No hay horarios semanales creados
          </div>
        )}
      </div>
      
      {/* Slot Assignment Modal */}
      {selectedSchedule && (
        <SlotAssignmentModal
          schedule={selectedSchedule}
          scheduleType="weekly"
          timeSlots={timeSlots}
          onClose={() => setSelectedSchedule(null)}
          onSubmit={handleAddTimeSlot}
        />
      )}
    </div>
  );
};

export default WeeklyScheduleTab;