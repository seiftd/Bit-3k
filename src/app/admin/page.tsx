'use client';

import { useState, useEffect } from 'react';

interface Stats {
  total_users: number;
  active_today: number;
  total_sbr_distributed: number;
  total_levels_completed: number;
  total_referrals: number;
}

export default function AdminPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple password check (in production, use proper authentication)
    if (password === 'admin123') {
      setAuthenticated(true);
      loadStats();
    } else {
      alert('Invalid password');
    }
  };

  const loadStats = async () => {
    try {
      // This would need actual authentication token
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/stats`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <h1 className="text-2xl font-bold mb-6 text-center">Admin Login</h1>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className="w-full px-4 py-2 border rounded-lg mb-4"
            />
            <button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">🎮 Bit 3K Admin Panel</h1>

        {loading ? (
          <div className="text-center">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard
              title="Total Users"
              value={stats?.total_users || 0}
              icon="👥"
              color="blue"
            />
            <StatCard
              title="Active Today"
              value={stats?.active_today || 0}
              icon="🟢"
              color="green"
            />
            <StatCard
              title="Total SBR"
              value={stats?.total_sbr_distributed.toFixed(2) || '0'}
              icon="💰"
              color="yellow"
            />
            <StatCard
              title="Levels Completed"
              value={stats?.total_levels_completed || 0}
              icon="✅"
              color="purple"
            />
            <StatCard
              title="Total Referrals"
              value={stats?.total_referrals || 0}
              icon="🤝"
              color="pink"
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
                Manage Users
              </button>
              <button className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">
                Manage Levels
              </button>
              <button className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded">
                View Leaderboard
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
            <p className="text-gray-500">No recent activity</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }: any) {
  const colors: any = {
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-green-100 text-green-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    purple: 'bg-purple-100 text-purple-800',
    pink: 'bg-pink-100 text-pink-800',
  };

  return (
    <div className={`${colors[color]} rounded-lg p-6`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold opacity-80">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
    </div>
  );
}

