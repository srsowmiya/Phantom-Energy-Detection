import React, { useEffect, useState } from 'react';
import { portsAPI, readingsAPI } from '../services/api';
import Layout from './Layout';

const Readings = () => {
  const [ports, setPorts] = useState([]);
  const [selectedPort, setSelectedPort] = useState(null);
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPorts();
  }, []);

  useEffect(() => {
    if (selectedPort) {
      fetchReadings(selectedPort);
    }
  }, [selectedPort]);

  const fetchPorts = async () => {
    try {
      setLoading(true);
      const response = await portsAPI.getPorts();
      if (response.success) {
        setPorts(response.data.ports || []);
        if (response.data.ports && response.data.ports.length > 0) {
          setSelectedPort(response.data.ports[0].id);
        }
      }
    } catch (err) {
      setError('Failed to fetch ports');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReadings = async (portId) => {
    try {
      setLoading(true);
      const response = await readingsAPI.getReadingsByPort(portId, { limit: 100 });
      if (response.success) {
        setReadings(response.data.readings || []);
      }
    } catch (err) {
      setError('Failed to fetch readings');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && ports.length === 0) {
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
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Power Readings</h1>
          <p className="text-gray-400">Monitor power consumption and readings</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-xl text-red-300">
            {error}
          </div>
        )}

        {ports.length === 0 ? (
          <div className="bg-[#1A0B2E] p-12 rounded-2xl border border-[#38BDF8]/20 text-center">
            <div className="text-6xl mb-4">📈</div>
            <h3 className="text-2xl font-bold mb-2">No Ports Available</h3>
            <p className="text-gray-400">Add ports to start monitoring power readings</p>
          </div>
        ) : (
          <>
            {/* Port Selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Select Port</label>
              <select
                value={selectedPort || ''}
                onChange={(e) => setSelectedPort(e.target.value)}
                className="w-full md:w-64 bg-[#1A0B2E] border border-[#38BDF8]/20 rounded-lg px-4 py-2 focus:outline-none focus:border-[#38BDF8]"
              >
                {ports.map((port) => (
                  <option key={port.id} value={port.id}>
                    {port.name} ({port.type})
                  </option>
                ))}
              </select>
            </div>

            {/* Readings Table */}
            {readings.length === 0 ? (
              <div className="bg-[#1A0B2E] p-12 rounded-2xl border border-[#38BDF8]/20 text-center">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-2xl font-bold mb-2">No Readings Found</h3>
                <p className="text-gray-400">Power readings will appear here once available</p>
              </div>
            ) : (
              <div className="bg-[#1A0B2E] rounded-2xl border border-[#38BDF8]/20 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[#0B0014] border-b border-[#38BDF8]/20">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold">Timestamp</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold">Voltage (V)</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold">Current (A)</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold">Power (W)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#38BDF8]/10">
                      {readings.map((reading) => (
                        <tr key={reading.id} className="hover:bg-[#0B0014]/50 transition-colors">
                          <td className="px-6 py-4 text-sm text-gray-300">
                            {new Date(reading.timestamp).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-300">{reading.voltage.toFixed(2)}</td>
                          <td className="px-6 py-4 text-sm text-gray-300">{reading.current.toFixed(2)}</td>
                          <td className="px-6 py-4 text-sm">
                            <span className={`font-semibold ${reading.power > 0 ? 'text-[#38BDF8]' : 'text-gray-400'}`}>
                              {reading.power.toFixed(2)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default Readings;


