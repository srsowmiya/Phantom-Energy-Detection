import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { analyticsAPI } from '../services/api';
import Layout from './Layout';

const AnalyticsReport = () => {
  const [analytics, setAnalytics] = useState(null);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [error, setError] = useState('');
  const [days, setDays] = useState(30);
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });

  useEffect(() => {
    fetchAnalytics();
    fetchInsights();
  }, [days, dateRange.startDate, dateRange.endDate]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await analyticsAPI.getAnalytics(
        days,
        dateRange.startDate || undefined,
        dateRange.endDate || undefined
      );
      if (response.success) {
        setAnalytics(response.data);
      }
    } catch (err) {
      setError('Failed to fetch analytics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchInsights = async () => {
    try {
      setLoadingInsights(true);
      const response = await analyticsAPI.getInsights(
        days,
        dateRange.startDate || undefined,
        dateRange.endDate || undefined
      );
      if (response.success) {
        setInsights(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch insights:', err);
    } finally {
      setLoadingInsights(false);
    }
  };

  const COLORS = ['#38BDF8', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-white text-xl">Loading...</div>
        </div>
      </Layout>
    );
  }

  if (!analytics) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto">
          <div className="bg-[#1A0B2E] p-12 rounded-2xl border border-[#38BDF8]/20 text-center">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-2xl font-bold mb-2">No Analytics Data</h3>
            <p className="text-gray-400">No data available for analytics</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Prepare data for charts
  const dailyPowerChartData = analytics.dailyPowerData.map(item => ({
    date: formatDate(item.date),
    avgPower: parseFloat(item.avgPower.toFixed(2)),
    maxPower: parseFloat(item.maxPower.toFixed(2)),
    minPower: parseFloat(item.minPower.toFixed(2))
  }));

  const phantomEventsChartData = analytics.phantomEventsByDay.map(item => ({
    date: formatDate(item.date),
    count: item.count,
    avgPower: parseFloat(item.avgPower.toFixed(2)),
    saved: parseFloat(item.saved.toFixed(2))
  }));

  const portBreakdownData = analytics.portBreakdown.map(item => ({
    name: item.portName,
    events: item.events,
    savedUnits: parseFloat(item.totalSavedUnits.toFixed(2)),
    savedMoney: parseFloat(item.totalSavedMoney.toFixed(2))
  }));

  const portPowerData = analytics.portPowerConsumption.map(item => ({
    name: item.portName,
    avgPower: parseFloat(item.avgPower.toFixed(2)),
    totalPower: parseFloat(item.totalPower.toFixed(2))
  }));

  // Savings by port data
  const savingsByPortData = analytics.portBreakdown.map(item => ({
    name: item.portName,
    savedMoney: parseFloat(item.totalSavedMoney.toFixed(2)),
    savedUnits: parseFloat(item.totalSavedUnits.toFixed(2))
  }));

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Analytical Report</h1>
            <p className="text-gray-400">Comprehensive energy consumption analysis with AI insights</p>
          </div>
          
          {/* Filters */}
          <div className="flex items-center space-x-4">
            <select
              value={days}
              onChange={(e) => setDays(parseInt(e.target.value))}
              className="bg-[#1A0B2E] border border-[#38BDF8]/20 rounded-lg px-4 py-2 focus:outline-none focus:border-[#38BDF8]"
              disabled={dateRange.startDate || dateRange.endDate}
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
              <option value={365}>Last year</option>
            </select>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              className="bg-[#1A0B2E] border border-[#38BDF8]/20 rounded-lg px-4 py-2 focus:outline-none focus:border-[#38BDF8]"
              placeholder="Start Date"
            />
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              className="bg-[#1A0B2E] border border-[#38BDF8]/20 rounded-lg px-4 py-2 focus:outline-none focus:border-[#38BDF8]"
              placeholder="End Date"
            />
            {(dateRange.startDate || dateRange.endDate) && (
              <button
                onClick={() => setDateRange({ startDate: '', endDate: '' })}
                className="bg-gray-600/20 hover:bg-gray-600/30 text-gray-300 px-4 py-2 rounded-lg transition-all text-sm"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-xl text-red-300">
            {error}
          </div>
        )}

        {/* AI Insights Section */}
        {insights && (
          <div className="mb-8 bg-gradient-to-br from-[#1A0B2E] to-[#0B0014] p-6 rounded-2xl border border-[#38BDF8]/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="text-3xl">🤖</div>
                <h2 className="text-2xl font-bold">AI-Powered Insights</h2>
                {insights.hasLLM && (
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-semibold">
                    Powered by AI
                  </span>
                )}
              </div>
              <button
                onClick={fetchInsights}
                disabled={loadingInsights}
                className="bg-[#38BDF8]/20 hover:bg-[#38BDF8]/30 text-[#38BDF8] px-4 py-2 rounded-lg transition-all text-sm disabled:opacity-50"
              >
                {loadingInsights ? 'Refreshing...' : '🔄 Refresh Insights'}
              </button>
            </div>
            {loadingInsights ? (
              <div className="text-gray-400">Generating insights...</div>
            ) : (
              <div className="prose prose-invert max-w-none">
                <div className="text-gray-200 whitespace-pre-wrap leading-relaxed">
                  {insights.insights}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-[#1A0B2E] p-6 rounded-2xl border border-[#38BDF8]/20">
            <div className="text-4xl mb-2">⚡</div>
            <h3 className="text-2xl font-bold mb-1">{analytics.summary.totalPhantomEvents}</h3>
            <p className="text-gray-400 text-sm">Phantom Events</p>
          </div>
          <div className="bg-[#1A0B2E] p-6 rounded-2xl border border-[#38BDF8]/20">
            <div className="text-4xl mb-2">💰</div>
            <h3 className="text-2xl font-bold mb-1">${analytics.summary.totalSavedMoney.toFixed(2)}</h3>
            <p className="text-gray-400 text-sm">Money Saved</p>
          </div>
          <div className="bg-[#1A0B2E] p-6 rounded-2xl border border-[#38BDF8]/20">
            <div className="text-4xl mb-2">🔋</div>
            <h3 className="text-2xl font-bold mb-1">{analytics.summary.totalSavedUnits.toFixed(2)}</h3>
            <p className="text-gray-400 text-sm">Units Saved (kWh)</p>
          </div>
          <div className="bg-[#1A0B2E] p-6 rounded-2xl border border-[#38BDF8]/20">
            <div className="text-4xl mb-2">📊</div>
            <h3 className="text-2xl font-bold mb-1">{analytics.summary.avgPower.toFixed(2)} W</h3>
            <p className="text-gray-400 text-sm">Avg Power</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="space-y-6">
          {/* Bar Chart - Phantom Events by Day */}
          <div className="bg-[#1A0B2E] p-6 rounded-2xl border border-[#38BDF8]/20">
            <h2 className="text-2xl font-bold mb-4">Phantom Events Over Time (Bar Chart)</h2>
            {phantomEventsChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={phantomEventsChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1A0B2E', border: '1px solid #38BDF8', borderRadius: '8px' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Legend />
                  <Bar dataKey="count" fill="#38BDF8" name="Event Count" />
                  <Bar dataKey="avgPower" fill="#F59E0B" name="Avg Power (W)" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-400">
                No data available
              </div>
            )}
          </div>

          {/* Line Chart - Daily Power Consumption */}
          <div className="bg-[#1A0B2E] p-6 rounded-2xl border border-[#38BDF8]/20">
            <h2 className="text-2xl font-bold mb-4">Daily Power Consumption (Line Chart)</h2>
            {dailyPowerChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={dailyPowerChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" label={{ value: 'Power (W)', angle: -90, position: 'insideLeft', fill: '#9CA3AF' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1A0B2E', border: '1px solid #38BDF8', borderRadius: '8px' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="avgPower" stroke="#38BDF8" strokeWidth={2} name="Avg Power (W)" />
                  <Line type="monotone" dataKey="maxPower" stroke="#10B981" strokeWidth={2} name="Max Power (W)" />
                  <Line type="monotone" dataKey="minPower" stroke="#F59E0B" strokeWidth={2} name="Min Power (W)" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-400">
                No data available
              </div>
            )}
          </div>

          {/* Pie Chart - Power Consumption by Port */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-[#1A0B2E] p-6 rounded-2xl border border-[#38BDF8]/20">
              <h2 className="text-2xl font-bold mb-4">Power Consumption by Port (Pie Chart)</h2>
              {portPowerData.length > 0 ? (
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={portPowerData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="avgPower"
                    >
                      {portPowerData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1A0B2E', border: '1px solid #38BDF8', borderRadius: '8px' }}
                      labelStyle={{ color: '#fff' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-400">
                  No data available
                </div>
              )}
            </div>

            {/* Bar Chart - Savings by Port */}
            <div className="bg-[#1A0B2E] p-6 rounded-2xl border border-[#38BDF8]/20">
              <h2 className="text-2xl font-bold mb-4">Savings by Port (Bar Chart)</h2>
              {savingsByPortData.length > 0 ? (
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={savingsByPortData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" stroke="#9CA3AF" angle={-45} textAnchor="end" height={100} />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1A0B2E', border: '1px solid #38BDF8', borderRadius: '8px' }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Legend />
                    <Bar dataKey="savedMoney" fill="#10B981" name="Saved Money ($)" />
                    <Bar dataKey="savedUnits" fill="#38BDF8" name="Saved Units (kWh)" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-400">
                  No data available
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AnalyticsReport;

