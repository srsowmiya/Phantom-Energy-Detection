import React, { useEffect, useState } from 'react';
import { reportsAPI } from '../services/api';
import Layout from './Layout';

const Reports = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);

  useEffect(() => {
    fetchReport();
  }, [year, month]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const response = await reportsAPI.getMonthlyReport(year, month);
      if (response.success) {
        setReport(response.data.report);
      }
    } catch (err) {
      setError('Failed to fetch report');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!report) return;
    
    const reportText = `
MONTHLY ENERGY REPORT
${report.period.monthName} ${report.period.year}

SUMMARY
========
Total Phantom Events: ${report.summary.totalPhantomEvents}
Resolved Events: ${report.summary.resolvedEvents}
Unresolved Events: ${report.summary.unresolvedEvents}
Auto Cut Events: ${report.summary.autoCutEvents}
Total Saved Units: ${report.summary.totalSavedUnits} kWh
Total Saved Money: $${report.summary.totalSavedMoney.toFixed(2)}
Average Phantom Power: ${report.summary.avgPhantomPower} W
Average Power Consumption: ${report.summary.avgPowerConsumption} W

DEVICES
========
Total Devices: ${report.devices.total}
Online Devices: ${report.devices.online}
Offline Devices: ${report.devices.offline}

PORTS
========
Total Ports: ${report.ports.total}

PORT BREAKDOWN
${report.ports.breakdown.map(p => `
  ${p.portName}:
    Events: ${p.count}
    Saved Units: ${p.totalSavedUnits} kWh
    Saved Money: $${p.totalSavedMoney.toFixed(2)}
    Avg Phantom Power: ${p.avgPhantomPower.toFixed(2)} W
`).join('')}

Generated on: ${new Date().toLocaleString()}
    `;

    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `energy-report-${report.period.monthName}-${report.period.year}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
            <h1 className="text-4xl font-bold mb-2">Monthly Reports</h1>
            <p className="text-gray-400">View detailed energy consumption reports</p>
          </div>
          {report && (
            <button
              onClick={handleDownload}
              className="bg-[#38BDF8] hover:bg-[#38BDF8]/80 text-white px-6 py-3 rounded-xl transition-all font-semibold"
            >
              📥 Download Report
            </button>
          )}
        </div>

        {/* Date Selector */}
        <div className="mb-8 bg-[#1A0B2E] p-6 rounded-2xl border border-[#38BDF8]/20">
          <div className="flex items-center space-x-4">
            <div>
              <label className="block text-sm font-medium mb-2">Year</label>
              <input
                type="number"
                min="2020"
                max={new Date().getFullYear()}
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
                className="bg-[#0B0014] border border-[#38BDF8]/20 rounded-lg px-4 py-2 focus:outline-none focus:border-[#38BDF8]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Month</label>
              <select
                value={month}
                onChange={(e) => setMonth(parseInt(e.target.value))}
                className="bg-[#0B0014] border border-[#38BDF8]/20 rounded-lg px-4 py-2 focus:outline-none focus:border-[#38BDF8]"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    {new Date(year, m - 1).toLocaleString('default', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-xl text-red-300">
            {error}
          </div>
        )}

        {report ? (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-[#1A0B2E] p-6 rounded-2xl border border-[#38BDF8]/20">
                <div className="text-4xl mb-2">⚡</div>
                <h3 className="text-2xl font-bold mb-1">{report.summary.totalPhantomEvents}</h3>
                <p className="text-gray-400 text-sm">Phantom Events</p>
              </div>
              <div className="bg-[#1A0B2E] p-6 rounded-2xl border border-[#38BDF8]/20">
                <div className="text-4xl mb-2">✅</div>
                <h3 className="text-2xl font-bold mb-1">{report.summary.resolvedEvents}</h3>
                <p className="text-gray-400 text-sm">Resolved Events</p>
              </div>
              <div className="bg-[#1A0B2E] p-6 rounded-2xl border border-[#38BDF8]/20">
                <div className="text-4xl mb-2">💰</div>
                <h3 className="text-2xl font-bold mb-1">${report.summary.totalSavedMoney.toFixed(2)}</h3>
                <p className="text-gray-400 text-sm">Money Saved</p>
              </div>
              <div className="bg-[#1A0B2E] p-6 rounded-2xl border border-[#38BDF8]/20">
                <div className="text-4xl mb-2">🔋</div>
                <h3 className="text-2xl font-bold mb-1">{report.summary.totalSavedUnits.toFixed(2)}</h3>
                <p className="text-gray-400 text-sm">Units Saved (kWh)</p>
              </div>
            </div>

            {/* Detailed Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-[#1A0B2E] p-6 rounded-2xl border border-[#38BDF8]/20">
                <h2 className="text-2xl font-bold mb-4">Statistics</h2>
                <div className="space-y-3">
                  <div className="flex justify-between p-3 bg-[#0B0014] rounded-xl">
                    <span className="text-gray-300">Auto Cut Events</span>
                    <span className="font-bold">{report.summary.autoCutEvents}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-[#0B0014] rounded-xl">
                    <span className="text-gray-300">Avg Phantom Power</span>
                    <span className="font-bold">{report.summary.avgPhantomPower.toFixed(2)} W</span>
                  </div>
                  <div className="flex justify-between p-3 bg-[#0B0014] rounded-xl">
                    <span className="text-gray-300">Avg Power Consumption</span>
                    <span className="font-bold">{report.summary.avgPowerConsumption.toFixed(2)} W</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#1A0B2E] p-6 rounded-2xl border border-[#38BDF8]/20">
                <h2 className="text-2xl font-bold mb-4">Devices & Ports</h2>
                <div className="space-y-3">
                  <div className="flex justify-between p-3 bg-[#0B0014] rounded-xl">
                    <span className="text-gray-300">Total Devices</span>
                    <span className="font-bold">{report.devices.total}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-[#0B0014] rounded-xl">
                    <span className="text-gray-300">Online Devices</span>
                    <span className="font-bold text-green-400">{report.devices.online}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-[#0B0014] rounded-xl">
                    <span className="text-gray-300">Total Ports</span>
                    <span className="font-bold">{report.ports.total}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Port Breakdown */}
            {report.ports.breakdown.length > 0 && (
              <div className="bg-[#1A0B2E] p-6 rounded-2xl border border-[#38BDF8]/20">
                <h2 className="text-2xl font-bold mb-4">Port Breakdown</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[#0B0014] border-b border-[#38BDF8]/20">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold">Port</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold">Events</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold">Saved Units (kWh)</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold">Saved Money</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold">Avg Power (W)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#38BDF8]/10">
                      {report.ports.breakdown.map((port, idx) => (
                        <tr key={idx} className="hover:bg-[#0B0014]/50 transition-colors">
                          <td className="px-6 py-4 text-sm text-gray-300 font-medium">{port.portName}</td>
                          <td className="px-6 py-4 text-sm text-gray-300">{port.count}</td>
                          <td className="px-6 py-4 text-sm text-gray-300">{port.totalSavedUnits.toFixed(2)}</td>
                          <td className="px-6 py-4 text-sm text-green-400 font-semibold">${port.totalSavedMoney.toFixed(2)}</td>
                          <td className="px-6 py-4 text-sm text-gray-300">{port.avgPhantomPower.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Daily Breakdown */}
            {report.dailyBreakdown && report.dailyBreakdown.length > 0 && (
              <div className="bg-[#1A0B2E] p-6 rounded-2xl border border-[#38BDF8]/20">
                <h2 className="text-2xl font-bold mb-4">Daily Breakdown</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {report.dailyBreakdown.map((day) => (
                    <div key={day.day} className="bg-[#0B0014] p-4 rounded-xl">
                      <p className="text-sm text-gray-400 mb-2">Day {day.day}</p>
                      <p className="text-lg font-bold mb-1">{day.events} events</p>
                      <p className="text-sm text-green-400">${day.savedMoney.toFixed(2)} saved</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-[#1A0B2E] p-12 rounded-2xl border border-[#38BDF8]/20 text-center">
            <div className="text-6xl mb-4">📄</div>
            <h3 className="text-2xl font-bold mb-2">No Data Available</h3>
            <p className="text-gray-400">No report data available for the selected period</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Reports;


