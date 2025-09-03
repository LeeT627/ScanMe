'use client';

import { useState, useEffect } from 'react';
import QRCodeGenerator from '@/components/QRCodeGenerator';
import QRCodeManager from '@/components/QRCodeManager';
import Login from '@/components/Login';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'generate' | 'manage'>('generate');

  useEffect(() => {
    // Check if user is already logged in
    const authEmail = document.cookie
      .split('; ')
      .find(row => row.startsWith('auth-email='))
      ?.split('=')[1];
    
    if (authEmail) {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const handleLogin = (email: string) => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    // Clear cookies
    document.cookie = 'auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'auth-email=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    setIsAuthenticated(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      {isAuthenticated ? (
        <div>
          <div className="flex justify-between items-center px-6 mb-4">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('generate')}
                className={`px-4 py-2 rounded ${
                  activeTab === 'generate'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Generate QR
              </button>
              <button
                onClick={() => setActiveTab('manage')}
                className={`px-4 py-2 rounded ${
                  activeTab === 'manage'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Manage QRs
              </button>
            </div>
            <button
              onClick={handleLogout}
              className="text-gray-600 hover:text-gray-800 underline"
            >
              Logout
            </button>
          </div>
          {activeTab === 'generate' ? <QRCodeGenerator /> : <QRCodeManager />}
        </div>
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </div>
  );
}
