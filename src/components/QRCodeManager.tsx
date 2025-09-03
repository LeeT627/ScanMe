'use client';

import { useState, useEffect } from 'react';
import QRCode from 'react-qr-code';

interface QRCodeItem {
  id: string;
  name: string;
  destination_url: string;
  scan_count: number;
  created_at: string;
}

export default function QRCodeManager() {
  const [qrCodes, setQrCodes] = useState<QRCodeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQR, setSelectedQR] = useState<string | null>(null);

  const fetchQRCodes = async () => {
    try {
      const response = await fetch('/api/qr/list');
      const data = await response.json();
      if (data.qrCodes) {
        setQrCodes(data.qrCodes);
      }
    } catch (error) {
      console.error('Failed to fetch QR codes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQRCodes();
  }, []);

  const deleteQRCode = async (qrId: string) => {
    if (!confirm('Are you sure you want to delete this QR code?')) {
      return;
    }

    try {
      const response = await fetch('/api/qr/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ qrId }),
      });

      if (response.ok) {
        // Remove from local state
        setQrCodes(qrCodes.filter(qr => qr.id !== qrId));
        setSelectedQR(null);
      } else {
        alert('Failed to delete QR code');
      }
    } catch (error) {
      console.error('Error deleting QR code:', error);
      alert('Failed to delete QR code');
    }
  };

  const getTrackingUrl = (id: string) => {
    return `${window.location.origin}/api/scan/${id}`;
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-gray-600">Loading QR codes...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-xl font-bold mb-6 text-gray-800">Your QR Codes</h2>
      
      {qrCodes.length === 0 ? (
        <div className="text-gray-500 text-center py-8">
          No QR codes generated yet
        </div>
      ) : (
        <div className="grid gap-4">
          {qrCodes.map((qr) => (
            <div
              key={qr.id}
              className="bg-white p-4 rounded-lg shadow border border-gray-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">{qr.name}</h3>
                  <div className="text-sm text-gray-500 mt-1">
                    Created: {new Date(qr.created_at).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-gray-500">
                    Scans: {qr.scan_count}
                  </div>
                  <div className="text-xs text-gray-400 mt-2 break-all">
                    ID: {qr.id}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedQR(selectedQR === qr.id ? null : qr.id)}
                    className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    {selectedQR === qr.id ? 'Hide' : 'Show'} QR
                  </button>
                  <button
                    onClick={() => deleteQRCode(qr.id)}
                    className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
              
              {selectedQR === qr.id && (
                <div className="mt-4 p-4 bg-gray-50 rounded">
                  <div className="flex items-center justify-center mb-4">
                    <QRCode
                      value={getTrackingUrl(qr.id)}
                      size={150}
                    />
                  </div>
                  <div className="text-xs text-gray-600 break-all text-center">
                    {getTrackingUrl(qr.id)}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}