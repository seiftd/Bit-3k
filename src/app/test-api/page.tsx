'use client';

import { useState } from 'react';

export default function TestAPIPage() {
  const [status, setStatus] = useState<string>('');
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://be-me.aizetecc.com/api';

  const testHealth = async () => {
    setLoading(true);
    setStatus('Testing...');
    try {
      const res = await fetch(`${apiUrl}/health`);
      const data = await res.json();
      setResponse({ status: res.status, data });
      setStatus(`✅ Success! Status: ${res.status}`);
    } catch (error: any) {
      setResponse({ error: error.message });
      setStatus(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testAuth = async () => {
    setLoading(true);
    setStatus('Testing authentication...');
    try {
      const res = await fetch(`${apiUrl}/api/auth/telegram`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegram_id: 123456789,
          username: 'test_user',
          first_name: 'Test',
        }),
      });
      const data = await res.json();
      setResponse({ status: res.status, data });
      if (res.ok) {
        setStatus(`✅ Auth Success! Token: ${data.access_token?.substring(0, 20)}...`);
      } else {
        setStatus(`❌ Auth Failed: ${res.status}`);
      }
    } catch (error: any) {
      setResponse({ error: error.message });
      setStatus(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">🔧 API Test Page</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <p className="mb-4">
            <strong>API URL:</strong> {apiUrl}
          </p>
          
          <div className="space-y-3">
            <button
              onClick={testHealth}
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg disabled:bg-gray-300"
            >
              Test /health Endpoint
            </button>
            
            <button
              onClick={testAuth}
              disabled={loading}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg disabled:bg-gray-300"
            >
              Test /api/auth/telegram Endpoint
            </button>
          </div>

          {status && (
            <div className={`mt-4 p-4 rounded-lg ${status.includes('✅') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
              {status}
            </div>
          )}

          {response && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <pre className="text-sm overflow-auto">
                {JSON.stringify(response, null, 2)}
              </pre>
            </div>
          )}
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-bold mb-2">ℹ️ Common Issues:</h3>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>CORS errors: Check backend CORS settings</li>
            <li>Network errors: API might not be running</li>
            <li>404 errors: Check API URL is correct</li>
            <li>500 errors: Check backend logs</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

