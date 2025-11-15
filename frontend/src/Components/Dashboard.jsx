import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { devicesAPI, portsAPI, notificationsAPI} from '../services/api';
import { getUser, clearAuth } from '../utils/auth';
import Layout from './Layout';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    devices: { total: 0, online: 0 },
    ports: { total: 0, active: 0, phantom: 0, off: 0 },
    notifications: { total: 0, unread: 0 },
    recentReadings: []
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user data
        const localUser = getUser();
        if (localUser) {
          setUser(localUser);
        }

        const userResponse = await authAPI.getMe();
        if (userResponse.success) {
          setUser(userResponse.data.user);
        }

        // Fetch dashboard stats
        const [devicesRes, portsRes, notificationsRes] = await Promise.all([
          devicesAPI.getDevices().catch(() => ({ success: false, data: { devices: [] } })),
          portsAPI.getPorts().catch(() => ({ success: false, data: { ports: [] } })),
          notificationsAPI.getNotifications({ limit: 5, unreadOnly: false }).catch(() => ({ success: false, data: { notifications: [] }, unreadCount: 0 }))
        ]);

        const devices = devicesRes.success ? devicesRes.data.devices : [];
        const ports = portsRes.success ? portsRes.data.ports : [];
        const notifications = notificationsRes.success ? notificationsRes.data.notifications : [];

        // Calculate stats
        const onlineDevices = devices.filter(d => d.is_online).length;
        const activePorts = ports.filter(p => p.status === 'active').length;
        const phantomPorts = ports.filter(p => p.status === 'phantom').length;
        const offPorts = ports.filter(p => p.status === 'off').length;

        setStats({
          devices: { total: devices.length, online: onlineDevices },
          ports: { total: ports.length, active: activePorts, phantom: phantomPorts, off: offPorts },
          notifications: { 
            total: notifications.length, 
            unread: notificationsRes.unreadCount || 0 
          },
          recentReadings: []
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        const localUser = getUser();
        if (!localUser) {
          clearAuth();
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            Welcome back, <span className="text-[#38BDF8]">{user?.name || 'User'}</span>!
          </h1>
          <p className="text-gray-400">Monitor and manage your energy consumption</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Devices Card */}
          <Link to="/devices" className="bg-[#1A0B2E] p-6 rounded-2xl hover:bg-[#1A0B2E]/80 transition-all border border-[#38BDF8]/20">
            <div className="flex items-center justify-between mb-4">
              <div className="text-4xl">📱</div>
              <div className={`px-3 py-1 rounded-full text-sm ${stats.devices.online > 0 ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                {stats.devices.online} Online
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-1">{stats.devices.total}</h3>
            <p className="text-gray-400 text-sm">Total Devices</p>
          </Link>

          {/* Ports Card */}
          <Link to="/ports" className="bg-[#1A0B2E] p-6 rounded-2xl hover:bg-[#1A0B2E]/80 transition-all border border-[#38BDF8]/20">
            <div className="flex items-center justify-between mb-4">
              <div className="text-4xl">🔌</div>
              <div className="flex space-x-2">
                <span className="px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400">
                  {stats.ports.active}
                </span>
                <span className="px-2 py-1 rounded-full text-xs bg-yellow-500/20 text-yellow-400">
                  {stats.ports.phantom}
                </span>
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-1">{stats.ports.total}</h3>
            <p className="text-gray-400 text-sm">Total Ports</p>
          </Link>

          {/* Notifications Card */}
          <Link to="/notifications" className="bg-[#1A0B2E] p-6 rounded-2xl hover:bg-[#1A0B2E]/80 transition-all border border-[#38BDF8]/20">
            <div className="flex items-center justify-between mb-4">
              <div className="text-4xl">🔔</div>
              {stats.notifications.unread > 0 && (
                <div className="bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                  {stats.notifications.unread}
                </div>
              )}
            </div>
            <h3 className="text-2xl font-bold mb-1">{stats.notifications.total}</h3>
            <p className="text-gray-400 text-sm">Notifications</p>
          </Link>

          {/* Energy Saved Card */}
          <Link to="/reports" className="bg-[#1A0B2E] p-6 rounded-2xl hover:bg-[#1A0B2E]/80 transition-all border border-[#38BDF8]/20">
            <div className="flex items-center justify-between mb-4">
              <div className="text-4xl">⚡</div>
              <div className="text-green-400 text-sm">View Reports</div>
            </div>
            <h3 className="text-2xl font-bold mb-1">Reports</h3>
            <p className="text-gray-400 text-sm">Monthly Analysis</p>
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Quick Access */}
          <div className="bg-[#1A0B2E] p-6 rounded-2xl border border-[#38BDF8]/20">
            <h2 className="text-2xl font-bold mb-4">Quick Access</h2>
            <div className="grid grid-cols-2 gap-4">
              <Link to="/devices" className="p-4 bg-[#0B0014] rounded-xl hover:bg-[#0B0014]/80 transition-all text-center">
                <div className="text-3xl mb-2">📱</div>
                <p className="text-sm font-medium">Devices</p>
              </Link>
              <Link to="/ports" className="p-4 bg-[#0B0014] rounded-xl hover:bg-[#0B0014]/80 transition-all text-center">
                <div className="text-3xl mb-2">🔌</div>
                <p className="text-sm font-medium">Ports</p>
              </Link>
              <Link to="/schedules" className="p-4 bg-[#0B0014] rounded-xl hover:bg-[#0B0014]/80 transition-all text-center">
                <div className="text-3xl mb-2">⏰</div>
                <p className="text-sm font-medium">Schedules</p>
              </Link>
              <Link to="/readings" className="p-4 bg-[#0B0014] rounded-xl hover:bg-[#0B0014]/80 transition-all text-center">
                <div className="text-3xl mb-2">📈</div>
                <p className="text-sm font-medium">Readings</p>
              </Link>
            </div>
          </div>

          {/* Status Overview */}
          <div className="bg-[#1A0B2E] p-6 rounded-2xl border border-[#38BDF8]/20">
            <h2 className="text-2xl font-bold mb-4">Status Overview</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-[#0B0014] rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span>Active Ports</span>
                </div>
                <span className="font-bold">{stats.ports.active}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#0B0014] rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span>Phantom Detected</span>
                </div>
                <span className="font-bold">{stats.ports.phantom}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#0B0014] rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                  <span>Off Ports</span>
                </div>
                <span className="font-bold">{stats.ports.off}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#0B0014] rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span>Online Devices</span>
                </div>
                <span className="font-bold">{stats.devices.online}/{stats.devices.total}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        {stats.notifications.total > 0 && (
          <div className="bg-[#1A0B2E] p-6 rounded-2xl border border-[#38BDF8]/20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Recent Notifications</h2>
              <Link to="/notifications" className="text-[#38BDF8] hover:underline text-sm">
                View All →
              </Link>
            </div>
            <p className="text-gray-400 text-sm">
              You have {stats.notifications.unread} unread notification{stats.notifications.unread !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
