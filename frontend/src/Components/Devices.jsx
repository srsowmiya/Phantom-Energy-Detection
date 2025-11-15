import React, { useEffect, useState } from 'react';
import { devicesAPI } from '../services/api';
import Layout from './Layout';

const Devices = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingDevice, setEditingDevice] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    mac_address: ''
  });

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      const response = await devicesAPI.getDevices();
      if (response.success) {
        setDevices(response.data.devices || []);
      }
    } catch (err) {
      setError('Failed to fetch devices');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingDevice) {
        await devicesAPI.updateDevice(editingDevice.id, formData);
      } else {
        await devicesAPI.createDevice(formData.name, formData.location, formData.mac_address);
      }
      setShowModal(false);
      setEditingDevice(null);
      setFormData({ name: '', location: '', mac_address: '' });
      fetchDevices();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save device');
    }
  };

  const handleEdit = (device) => {
    setEditingDevice(device);
    setFormData({
      name: device.name,
      location: device.location,
      mac_address: device.mac_address
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this device?')) {
      try {
        await devicesAPI.deleteDevice(id);
        fetchDevices();
      } catch (err) {
        setError('Failed to delete device');
      }
    }
  };

  const handleGenerateToken = async (id) => {
    try {
      const response = await devicesAPI.generateDeviceToken(id);
      if (response.success) {
        alert(`Device Token: ${response.data.token}\n\nCopy this token for device authentication.`);
      }
    } catch (err) {
      setError('Failed to generate token');
    }
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
            <h1 className="text-4xl font-bold mb-2">Devices Management</h1>
            <p className="text-gray-400">Manage your monitoring devices</p>
          </div>
          <button
            onClick={() => {
              setEditingDevice(null);
              setFormData({ name: '', location: '', mac_address: '' });
              setShowModal(true);
            }}
            className="bg-[#38BDF8] hover:bg-[#38BDF8]/80 text-white px-6 py-3 rounded-xl transition-all font-semibold"
          >
            + Add Device
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-xl text-red-300">
            {error}
          </div>
        )}

        {devices.length === 0 ? (
          <div className="bg-[#1A0B2E] p-12 rounded-2xl border border-[#38BDF8]/20 text-center">
            <div className="text-6xl mb-4">📱</div>
            <h3 className="text-2xl font-bold mb-2">No Devices Found</h3>
            <p className="text-gray-400 mb-6">Get started by adding your first device</p>
            <button
              onClick={() => {
                setEditingDevice(null);
                setFormData({ name: '', location: '', mac_address: '' });
                setShowModal(true);
              }}
              className="bg-[#38BDF8] hover:bg-[#38BDF8]/80 text-white px-6 py-3 rounded-xl transition-all"
            >
              Add Device
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {devices.map((device) => (
              <div key={device.id} className="bg-[#1A0B2E] p-6 rounded-2xl border border-[#38BDF8]/20 hover:border-[#38BDF8]/40 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="text-4xl">📱</div>
                  <div className={`px-3 py-1 rounded-full text-xs ${device.is_online ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                    {device.is_online ? 'Online' : 'Offline'}
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2">{device.name}</h3>
                <div className="space-y-2 text-sm text-gray-400 mb-4">
                  <p><span className="font-semibold text-gray-300">Location:</span> {device.location}</p>
                  <p><span className="font-semibold text-gray-300">MAC:</span> <code className="bg-[#0B0014] px-2 py-1 rounded">{device.mac_address}</code></p>
                  {device.last_seen && (
                    <p><span className="font-semibold text-gray-300">Last Seen:</span> {new Date(device.last_seen).toLocaleString()}</p>
                  )}
                </div>
                <div className="flex space-x-2 mt-4">
                  <button
                    onClick={() => handleEdit(device)}
                    className="flex-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-4 py-2 rounded-lg transition-all text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleGenerateToken(device.id)}
                    className="flex-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 px-4 py-2 rounded-lg transition-all text-sm"
                  >
                    Token
                  </button>
                  <button
                    onClick={() => handleDelete(device.id)}
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
            <div className="bg-[#1A0B2E] rounded-2xl p-6 max-w-md w-full border border-[#38BDF8]/20">
              <h2 className="text-2xl font-bold mb-6">{editingDevice ? 'Edit Device' : 'Add Device'}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Device Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-[#0B0014] border border-[#38BDF8]/20 rounded-lg px-4 py-2 focus:outline-none focus:border-[#38BDF8]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Location</label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full bg-[#0B0014] border border-[#38BDF8]/20 rounded-lg px-4 py-2 focus:outline-none focus:border-[#38BDF8]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">MAC Address</label>
                  <input
                    type="text"
                    required
                    value={formData.mac_address}
                    onChange={(e) => setFormData({ ...formData, mac_address: e.target.value })}
                    className="w-full bg-[#0B0014] border border-[#38BDF8]/20 rounded-lg px-4 py-2 focus:outline-none focus:border-[#38BDF8]"
                    disabled={!!editingDevice}
                  />
                  {editingDevice && (
                    <p className="text-xs text-gray-400 mt-1">MAC address cannot be changed</p>
                  )}
                </div>
                <div className="flex space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingDevice(null);
                      setFormData({ name: '', location: '', mac_address: '' });
                    }}
                    className="flex-1 bg-gray-600/20 hover:bg-gray-600/30 text-gray-300 px-4 py-2 rounded-lg transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-[#38BDF8] hover:bg-[#38BDF8]/80 text-white px-4 py-2 rounded-lg transition-all"
                  >
                    {editingDevice ? 'Update' : 'Create'}
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

export default Devices;


