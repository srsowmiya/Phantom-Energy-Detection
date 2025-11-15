import React, { useEffect, useState } from 'react';
import { schedulesAPI, portsAPI } from '../services/api';
import Layout from './Layout';

const Schedules = () => {
  const [schedules, setSchedules] = useState([]);
  const [ports, setPorts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [formData, setFormData] = useState({
    port: '',
    start_time: '',
    end_time: '',
    days: [],
    is_active: true
  });

  const dayOptions = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    fetchPorts();
    fetchSchedules();
  }, []);

  const fetchPorts = async () => {
    try {
      const response = await portsAPI.getPorts();
      if (response.success) {
        setPorts(response.data.ports || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const response = await schedulesAPI.getSchedules();
      if (response.success) {
        setSchedules(response.data.schedules || []);
      }
    } catch (err) {
      setError('Failed to fetch schedules');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Convert days array to comma-separated string for API
      const daysString = Array.isArray(formData.days) ? formData.days.join(',') : formData.days;
      
      if (editingSchedule) {
        await schedulesAPI.updateSchedule(editingSchedule.id, {
          ...formData,
          days: daysString
        });
      } else {
        await schedulesAPI.createSchedule(formData.port, formData.start_time, formData.end_time, daysString, formData.is_active);
      }
      setShowModal(false);
      setEditingSchedule(null);
      setFormData({ port: '', start_time: '', end_time: '', days: [], is_active: true });
      fetchSchedules();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save schedule');
    }
  };

  const handleEdit = (schedule) => {
    setEditingSchedule(schedule);
    // Handle days as string (from DB) or array
    let daysArray = [];
    if (Array.isArray(schedule.days)) {
      daysArray = schedule.days;
    } else if (typeof schedule.days === 'string') {
      daysArray = schedule.days.split(',').map(d => d.trim());
    }
    
    setFormData({
      port: schedule.portId,
      start_time: schedule.start_time,
      end_time: schedule.end_time,
      days: daysArray,
      is_active: schedule.is_active
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this schedule?')) {
      try {
        await schedulesAPI.deleteSchedule(id);
        fetchSchedules();
      } catch (err) {
        setError('Failed to delete schedule');
      }
    }
  };

  const toggleDay = (day) => {
    setFormData({
      ...formData,
      days: formData.days.includes(day)
        ? formData.days.filter(d => d !== day)
        : [...formData.days, day]
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-white text-xl">Loading...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Schedules</h1>
            <p className="text-gray-400">Automate port control with schedules</p>
          </div>
          <button
            onClick={() => {
              setEditingSchedule(null);
              setFormData({ port: '', start_time: '', end_time: '', days: [], is_active: true });
              setShowModal(true);
            }}
            className="bg-[#38BDF8] hover:bg-[#38BDF8]/80 text-white px-6 py-3 rounded-xl transition-all font-semibold"
          >
            + Add Schedule
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-xl text-red-300">
            {error}
          </div>
        )}

        {schedules.length === 0 ? (
          <div className="bg-[#1A0B2E] p-12 rounded-2xl border border-[#38BDF8]/20 text-center">
            <div className="text-6xl mb-4">⏰</div>
            <h3 className="text-2xl font-bold mb-2">No Schedules Found</h3>
            <p className="text-gray-400 mb-6">Create schedules to automate port control</p>
            <button
              onClick={() => {
                setEditingSchedule(null);
                setFormData({ port: '', start_time: '', end_time: '', days: [], is_active: true });
                setShowModal(true);
              }}
              className="bg-[#38BDF8] hover:bg-[#38BDF8]/80 text-white px-6 py-3 rounded-xl transition-all"
            >
              Add Schedule
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {schedules.map((schedule) => (
              <div
                key={schedule.id}
                className={`bg-[#1A0B2E] p-6 rounded-2xl border transition-all ${
                  schedule.is_active
                    ? 'border-[#38BDF8]/20'
                    : 'border-gray-500/20 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="text-4xl">⏰</div>
                  <div className={`px-3 py-1 rounded-full text-xs ${schedule.is_active ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                    {schedule.is_active ? 'Active' : 'Inactive'}
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2">
                  {schedule.portData ? schedule.portData.name : 'Unknown Port'}
                </h3>
                <div className="space-y-2 text-sm text-gray-400 mb-4">
                  <p><span className="font-semibold text-gray-300">Time:</span> {schedule.start_time} - {schedule.end_time}</p>
                  <p><span className="font-semibold text-gray-300">Days:</span> {
                    Array.isArray(schedule.days) 
                      ? schedule.days.join(', ') 
                      : typeof schedule.days === 'string' 
                        ? schedule.days.split(',').map(d => d.trim()).join(', ')
                        : 'N/A'
                  }</p>
                </div>
                <div className="flex space-x-2 mt-4">
                  <button
                    onClick={() => handleEdit(schedule)}
                    className="flex-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-4 py-2 rounded-lg transition-all text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(schedule.id)}
                    className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded-lg transition-all text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-[#1A0B2E] rounded-2xl p-6 max-w-md w-full border border-[#38BDF8]/20 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-6">{editingSchedule ? 'Edit Schedule' : 'Add Schedule'}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Port</label>
                  <select
                    required
                    value={formData.port}
                    onChange={(e) => setFormData({ ...formData, port: e.target.value })}
                    className="w-full bg-[#0B0014] border border-[#38BDF8]/20 rounded-lg px-4 py-2 focus:outline-none focus:border-[#38BDF8]"
                  >
                    <option value="">Select a port</option>
                    {ports.map((port) => (
                      <option key={port.id} value={port.id}>
                        {port.name} ({port.type})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Start Time</label>
                  <input
                    type="time"
                    required
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    className="w-full bg-[#0B0014] border border-[#38BDF8]/20 rounded-lg px-4 py-2 focus:outline-none focus:border-[#38BDF8]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">End Time</label>
                  <input
                    type="time"
                    required
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    className="w-full bg-[#0B0014] border border-[#38BDF8]/20 rounded-lg px-4 py-2 focus:outline-none focus:border-[#38BDF8]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 mb-3">Days</label>
                  <div className="grid grid-cols-2 gap-2">
                    {dayOptions.map((day) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDay(day)}
                        className={`px-4 py-2 rounded-lg transition-all text-sm ${
                          formData.days.includes(day)
                            ? 'bg-[#38BDF8] text-white'
                            : 'bg-[#0B0014] border border-[#38BDF8]/20 text-gray-300 hover:border-[#38BDF8]/40'
                        }`}
                      >
                        {day.substring(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-5 h-5 rounded"
                  />
                  <label htmlFor="is_active" className="text-sm">Active</label>
                </div>
                <div className="flex space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingSchedule(null);
                      setFormData({ port: '', start_time: '', end_time: '', days: [], is_active: true });
                    }}
                    className="flex-1 bg-gray-600/20 hover:bg-gray-600/30 text-gray-300 px-4 py-2 rounded-lg transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-[#38BDF8] hover:bg-[#38BDF8]/80 text-white px-4 py-2 rounded-lg transition-all"
                  >
                    {editingSchedule ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Schedules;


