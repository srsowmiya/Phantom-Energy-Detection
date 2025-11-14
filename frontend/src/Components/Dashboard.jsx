import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { getUser, clearAuth } from '../utils/auth';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      // Try to get user from localStorage first for immediate display
      const localUser = getUser();
      if (localUser) {
        setUser(localUser);
      }

      // Then fetch fresh data from API
      try {
        const response = await authAPI.getMe();
        if (response.success) {
          setUser(response.data.user);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        // If API call fails and no local user, redirect to login
        if (!localUser) {
          clearAuth();
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-[#0B0014]">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#0B0014] text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">
            Welcome to <span className="text-[#38BDF8]">Phantom</span> Energy Detection
          </h1>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-xl transition-all"
          >
            Logout
          </button>
        </div>

        {user && (
          <div className="bg-[#1A0B2E] p-6 rounded-2xl shadow-glow mb-6">
            <h2 className="text-2xl font-semibold mb-4">User Information</h2>
            <div className="space-y-2 text-gray-300">
              <p><span className="font-semibold">Name:</span> {user.name}</p>
              <p><span className="font-semibold">Email:</span> {user.email}</p>
            </div>
          </div>
        )}

        <div className="bg-[#1A0B2E] p-6 rounded-2xl shadow-glow">
          <h2 className="text-2xl font-semibold mb-4">Dashboard</h2>
          <p className="text-gray-300">Your dashboard content will appear here.</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
