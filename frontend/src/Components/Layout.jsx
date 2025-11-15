import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { clearAuth, getUser } from '../utils/auth';

const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = getUser();

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path ? 'bg-[#38BDF8]/20 text-[#38BDF8]' : 'text-gray-300 hover:bg-[#1A0B2E]';
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/devices', label: 'Devices', icon: '📱' },
    { path: '/ports', label: 'Ports', icon: '🔌' },
    { path: '/readings', label: 'Readings', icon: '📈' },
    { path: '/schedules', label: 'Schedules', icon: '⏰' },
    { path: '/notifications', label: 'Notifications', icon: '🔔' },
    { path: '/reports', label: 'Reports', icon: '📄' },
  ];

  return (
    <div className="min-h-screen bg-[#0B0014] text-white">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-64 bg-[#1A0B2E] border-r border-[#38BDF8]/20 flex flex-col z-10">
        {/* Logo/Header */}
        <div className="p-6 border-b border-[#38BDF8]/20">
          <Link to="/dashboard" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-[#38BDF8]">⚡</span>
            <span className="text-xl font-bold">Phantom</span>
          </Link>
          {user && (
            <p className="text-sm text-gray-400 mt-2 truncate">{user.email}</p>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${isActive(item.path)}`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-[#38BDF8]/20">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-600/20 hover:bg-red-600/30 text-red-300 rounded-lg transition-all"
          >
            <span>🚪</span>
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;

