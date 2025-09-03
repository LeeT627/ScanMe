'use client';

import { useState } from 'react';
import QRCode from 'react-qr-code';

export default function QRCodeGenerator() {
  const [qrId, setQrId] = useState<string>('');
  const [qrName, setQrName] = useState<string>('');
  const [generatedUrl, setGeneratedUrl] = useState<string>('');
  const [savedName, setSavedName] = useState<string>('');

  const generateQR = async () => {
    if (!qrName.trim()) {
      alert('Please enter a name for the QR code');
      return;
    }
    
    // Generate a proper UUID v4
    const id = crypto.randomUUID();
    
    // Save QR code to database
    try {
      const response = await fetch('/api/qr/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: id,
          name: qrName
        })
      });

      if (!response.ok) {
        alert('Failed to save QR code');
        return;
      }

      // Generate tracking URL
      const trackingUrl = `${window.location.origin}/api/scan/${id}`;
      setQrId(id);
      setGeneratedUrl(trackingUrl);
      setSavedName(qrName);
      setQrName(''); // Clear input for next QR
    } catch (error) {
      console.error('Error creating QR code:', error);
      alert('Failed to create QR code');
    }
  };

  const downloadQR = () => {
    const svg = document.getElementById('qr-code');
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);
      const downloadLink = document.createElement('a');
      downloadLink.href = svgUrl;
      downloadLink.download = `qr-${savedName.replace(/[^a-z0-9]/gi, '_')}.svg`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
        QR Code Generator
      </h1>
      
      <div className="mb-6">
        <input
          type="text"
          value={qrName}
          onChange={(e) => setQrName(e.target.value)}
          placeholder="Enter QR code name (e.g., Campaign 1, Event A)"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black placeholder-gray-500"
        />
      </div>
      
      <div className="text-center mb-6">
        <button
          onClick={generateQR}
          className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-lg transition-colors"
        >
          Generate QR Code
        </button>
      </div>

      {generatedUrl && (
        <div className="text-center space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <QRCode
              id="qr-code"
              value={generatedUrl}
              size={200}
              style={{ height: "auto", maxWidth: "100%", width: "100%" }}
            />
          </div>
          
          <div className="text-sm text-gray-600 break-all">
            <strong>Name:</strong> {savedName}
          </div>
          
          <div className="text-sm text-gray-600 break-all">
            <strong>ID:</strong> {qrId}
          </div>
          
          <div className="text-sm text-gray-600 break-all">
            <strong>Tracking URL:</strong> {generatedUrl}
          </div>
          
          <button
            onClick={downloadQR}
            className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Download QR Code
          </button>
        </div>
      )}
    </div>
  );
}