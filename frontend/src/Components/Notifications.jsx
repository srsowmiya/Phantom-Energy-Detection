import React, { useEffect, useState } from 'react';
import { notificationsAPI } from '../services/api';
import Layout from './Layout';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationsAPI.getNotifications({ limit: 100 });
      if (response.success) {
        setNotifications(response.data.notifications || []);
        setUnreadCount(response.unreadCount || 0);
      }
    } catch (err) {
      setError('Failed to fetch notifications');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationsAPI.markAsRead(id);
      fetchNotifications();
    } catch (err) {
      setError('Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      fetchNotifications();
    } catch (err) {
      setError('Failed to mark all as read');
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationsAPI.deleteNotification(id);
      fetchNotifications();
    } catch (err) {
      setError('Failed to delete notification');
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
            <h1 className="text-4xl font-bold mb-2">Notifications</h1>
            <p className="text-gray-400">Stay updated with system alerts</p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="bg-[#38BDF8] hover:bg-[#38BDF8]/80 text-white px-6 py-3 rounded-xl transition-all font-semibold"
            >
              Mark All as Read
            </button>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-xl text-red-300">
            {error}
          </div>
        )}

        {notifications.length === 0 ? (
          <div className="bg-[#1A0B2E] p-12 rounded-2xl border border-[#38BDF8]/20 text-center">
            <div className="text-6xl mb-4">🔔</div>
            <h3 className="text-2xl font-bold mb-2">No Notifications</h3>
            <p className="text-gray-400">You're all caught up!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-[#1A0B2E] p-6 rounded-2xl border transition-all ${
                  notification.is_read
                    ? 'border-[#38BDF8]/20'
                    : 'border-[#38BDF8]/40 bg-[#1A0B2E]/80'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      {!notification.is_read && (
                        <div className="w-2 h-2 bg-[#38BDF8] rounded-full"></div>
                      )}
                      <h3 className={`font-semibold ${notification.is_read ? 'text-gray-400' : 'text-white'}`}>
                        {notification.message}
                      </h3>
                    </div>
                    {notification.portData && (
                      <p className="text-sm text-gray-400 mb-2">
                        Port: {notification.portData.name} ({notification.portData.type})
                      </p>
                    )}
                    <p className="text-xs text-gray-500">
                      {new Date(notification.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    {!notification.is_read && (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-3 py-1 rounded-lg transition-all text-sm"
                      >
                        Mark Read
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(notification.id)}
                      className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-3 py-1 rounded-lg transition-all text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Notifications;

