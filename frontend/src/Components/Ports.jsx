import React, { useEffect, useState } from 'react';
import { portsAPI } from '../services/api';
import Layout from './Layout';

const Ports = () => {
  const [ports, setPorts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPort, setEditingPort] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    threshold: 5.0,
    autoCut: true
  });

  useEffect(() => {
    fetchPorts();
  }, []);

  const fetchPorts = async () => {
    try {
      setLoading(true);
      const response = await portsAPI.getPorts();
      if (response.success) {
        setPorts(response.data.ports || []);
      }
    } catch (err) {
      setError('Failed to fetch ports');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPort) {
        await portsAPI.updatePort(editingPort.id, formData);
      } else {
        await portsAPI.createPort(formData.name, formData.type, formData.threshold, formData.autoCut);
      }
      setShowModal(false);
      setEditingPort(null);
      setFormData({ name: '', type: '', threshold: 5.0, autoCut: true });
      fetchPorts();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save port');
    }
  };

  const handleEdit = (port) => {
    setEditingPort(port);
    setFormData({
      name: port.name,
      type: port.type,
      threshold: port.threshold,
      autoCut: port.autoCut
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this port?')) {
      try {
        await portsAPI.deletePort(id);
        fetchPorts();
      } catch (err) {
        setError('Failed to delete port');
      }
    }
  };

  const handleSwitch = async (id, state) => {
    try {
      await portsAPI.switchPort(id, state);
      fetchPorts();
    } catch (err) {
      setError('Failed to switch port');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400';
      case 'phantom': return 'bg-yellow-500/20 text-yellow-400';
      case 'off': return 'bg-gray-500/20 text-gray-400';
      default: return 'bg-gray-500/20 text-gray-400';
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
            <h1 className="text-4xl font-bold mb-2">Ports Management</h1>
            <p className="text-gray-400">Manage power ports and monitor status</p>
          </div>
          <button
            onClick={() => {
              setEditingPort(null);
              setFormData({ name: '', type: '', threshold: 5.0, autoCut: true });
              setShowModal(true);
            }}
            className="bg-[#38BDF8] hover:bg-[#38BDF8]/80 text-white px-6 py-3 rounded-xl transition-all font-semibold"
          >
            + Add Port
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-xl text-red-300">
            {error}
          </div>
        )}

        {ports.length === 0 ? (
          <div className="bg-[#1A0B2E] p-12 rounded-2xl border border-[#38BDF8]/20 text-center">
            <div className="text-6xl mb-4">🔌</div>
            <h3 className="text-2xl font-bold mb-2">No Ports Found</h3>
            <p className="text-gray-400 mb-6">Get started by adding your first port</p>
            <button
              onClick={() => {
                setEditingPort(null);
                setFormData({ name: '', type: '', threshold: 5.0, autoCut: true });
                setShowModal(true);
              }}
              className="bg-[#38BDF8] hover:bg-[#38BDF8]/80 text-white px-6 py-3 rounded-xl transition-all"
            >
              Add Port
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ports.map((port) => (
              <div key={port.id} className="bg-[#1A0B2E] p-6 rounded-2xl border border-[#38BDF8]/20 hover:border-[#38BDF8]/40 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="text-4xl">🔌</div>
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(port.status)}`}>
                    {port.status.toUpperCase()}
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2">{port.name}</h3>
                <div className="space-y-2 text-sm text-gray-400 mb-4">
                  <p><span className="font-semibold text-gray-300">Type:</span> {port.type}</p>
                  <p><span className="font-semibold text-gray-300">Threshold:</span> {port.threshold}W</p>
                  <p><span className="font-semibold text-gray-300">Auto Cut:</span> {port.autoCut ? 'Enabled' : 'Disabled'}</p>
                </div>
                <div className="flex space-x-2 mt-4">
                  <button
                    onClick={() => handleSwitch(port.id, port.status === 'off')}
                    className={`flex-1 px-4 py-2 rounded-lg transition-all text-sm font-semibold ${
                      port.status === 'off'
                        ? 'bg-green-500/20 hover:bg-green-500/30 text-green-400'
                        : 'bg-red-500/20 hover:bg-red-500/30 text-red-400'
                    }`}
                  >
                    {port.status === 'off' ? 'Turn On' : 'Turn Off'}
                  </button>
                  <button
                    onClick={() => handleEdit(port)}
                    className="flex-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-4 py-2 rounded-lg transition-all text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(port.id)}
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
              <h2 className="text-2xl font-bold mb-6">{editingPort ? 'Edit Port' : 'Add Port'}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Port Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-[#0B0014] border border-[#38BDF8]/20 rounded-lg px-4 py-2 focus:outline-none focus:border-[#38BDF8]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Type</label>
                  <input
                    type="text"
                    required
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    placeholder="e.g., AC, USB, Power Strip"
                    className="w-full bg-[#0B0014] border border-[#38BDF8]/20 rounded-lg px-4 py-2 focus:outline-none focus:border-[#38BDF8]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Phantom Threshold (Watts)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    required
                    value={formData.threshold}
                    onChange={(e) => setFormData({ ...formData, threshold: parseFloat(e.target.value) })}
                    className="w-full bg-[#0B0014] border border-[#38BDF8]/20 rounded-lg px-4 py-2 focus:outline-none focus:border-[#38BDF8]"
                  />
                </div>
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="autoCut"
                    checked={formData.autoCut}
                    onChange={(e) => setFormData({ ...formData, autoCut: e.target.checked })}
                    className="w-5 h-5 rounded"
                  />
                  <label htmlFor="autoCut" className="text-sm">Enable Auto Cut</label>
                </div>
                <div className="flex space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingPort(null);
                      setFormData({ name: '', type: '', threshold: 5.0, autoCut: true });
                    }}
                    className="flex-1 bg-gray-600/20 hover:bg-gray-600/30 text-gray-300 px-4 py-2 rounded-lg transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-[#38BDF8] hover:bg-[#38BDF8]/80 text-white px-4 py-2 rounded-lg transition-all"
                  >
                    {editingPort ? 'Update' : 'Create'}
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

export default Ports;


