// src/components/scheduling/SlotAssignmentModal.jsx
import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';

const SlotAssignmentModal = ({ 
  schedule, 
  scheduleType,
  timeSlots, 
  onClose, 
  onSubmit 
}) => {
  const [newAssignment, setNewAssignment] = useState({
    time_slot: '',
    order: 0,
    notes: ''
  });
  console.log(schedule)
  const handleAssignmentChange = (e) => {
    const { name, value } = e.target;
    setNewAssignment({
      ...newAssignment,
      [name]: name === 'order' ? parseInt(value, 10) : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(newAssignment);
    setNewAssignment({
      time_slot: '',
      order: 0,
      notes: ''
    });
  };

  const getScheduleTitle = () => {
    if (scheduleType === 'specific') {
      return `${schedule.name} (${format(parseISO(schedule.date), 'MMM d, yyyy')})`;
    } else {
      const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      return `${schedule.name} (${weekdays[schedule.weekday]})`;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded shadow p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold ">
            Add Time Slots to {getScheduleTitle()}
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Time Slot</label>
            <select
              name="time_slot"
              value={newAssignment.time_slot}
              onChange={handleAssignmentChange}
              className="w-full p-2 border rounded"
              required
            >
              <option value="">Select a time slot</option>
              {timeSlots.map(slot => (
                <option key={slot.id} value={slot.id}>
                  {slot.name} ({slot.start_time} - {slot.end_time})
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Order</label>
            <input
              type="number"
              name="order"
              min="0"
              value={newAssignment.order}
              onChange={handleAssignmentChange}
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea
              name="notes"
              value={newAssignment.notes}
              onChange={handleAssignmentChange}
              className="w-full p-2 border rounded"
              rows="3"
            ></textarea>
          </div>
          
          <button type="submit" className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
            Add Time Slot to Schedule
          </button>
        </form>
        
        <div className="mt-6">
          <h4 className="font-medium mb-2">Current Time Slots:</h4>
          <ul className="space-y-2">
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
              <li className="text-gray-500">No time slots assigned</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SlotAssignmentModal;