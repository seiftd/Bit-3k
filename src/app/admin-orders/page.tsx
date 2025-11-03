'use client';

import { useEffect, useState } from 'react';

interface ShopOrder {
  id: number;
  user_id: number;
  username: string | null;
  telegram_id: number | null;
  order_type: 'ooredoo' | 'mobilis' | 'usdt';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  phone_number: string | null;
  binance_id: string | null;
  amount: number;
  points_cost: number;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<ShopOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [token, setToken] = useState<string>('');
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://be-me.aizetecc.com/api';

  useEffect(() => {
    const savedToken = localStorage.getItem('admin_token');
    if (savedToken) {
      setToken(savedToken);
      setAuthenticated(true);
      loadOrders(savedToken);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    // Simple password check (in production, use proper authentication)
    if (password === 'admin123') {
      const fakeToken = 'admin_' + Date.now();
      localStorage.setItem('admin_token', fakeToken);
      setToken(fakeToken);
      setAuthenticated(true);
      await loadOrders(fakeToken);
    } else {
      alert('Invalid password');
    }
  };

  const loadOrders = async (authToken: string) => {
    setLoading(true);
    try {
      // Get admin JWT token (you'll need to implement proper admin login endpoint)
      const response = await fetch(`${apiUrl}/admin/shop-orders?status=${statusFilter}&order_type=${typeFilter === 'all' ? '' : typeFilter}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      } else if (response.status === 401) {
        setAuthenticated(false);
        localStorage.removeItem('admin_token');
      }
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: number, newStatus: string, notes?: string) => {
    try {
      const response = await fetch(`${apiUrl}/admin/shop-orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: newStatus,
          admin_notes: notes || null,
        }),
      });

      if (response.ok) {
        await loadOrders(token);
        alert('Order updated successfully!');
      } else {
        alert('Failed to update order');
      }
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Error updating order');
    }
  };

  useEffect(() => {
    if (authenticated && token) {
      loadOrders(token);
    }
  }, [statusFilter, typeFilter, authenticated, token]);

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full border border-gray-700">
          <h1 className="text-2xl font-bold mb-6 text-center text-white">Admin Login</h1>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className="w-full px-4 py-2 border border-gray-600 rounded-lg mb-4 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
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
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-4xl font-bold text-white">🛒 Shop Orders Management</h1>
          <button
            onClick={() => {
              localStorage.removeItem('admin_token');
              setAuthenticated(false);
            }}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
          >
            Logout
          </button>
        </div>

        {/* Filters */}
        <div className="bg-gray-800 rounded-lg p-4 mb-6 border border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Filter by Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="cancelled">Cancelled</option>
                <option value="all">All</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Filter by Type</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="all">All</option>
                <option value="ooredoo">Ooredoo</option>
                <option value="mobilis">Mobilis</option>
                <option value="usdt">USDT</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => loadOrders(token)}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center text-gray-400 py-8">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="text-center text-gray-400 py-8">No orders found</div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Order ID</div>
                    <div className="text-lg font-bold text-white">#{order.id}</div>
                    
                    <div className="text-sm text-gray-400 mb-1 mt-3">User</div>
                    <div className="text-white">
                      {order.username ? `@${order.username}` : 'N/A'} ({order.telegram_id})
                    </div>
                    
                    <div className="text-sm text-gray-400 mb-1 mt-3">Type</div>
                    <div className="text-white capitalize">{order.order_type}</div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-400 mb-1">Status</div>
                    <div className={`inline-block px-3 py-1 rounded text-sm font-semibold ${
                      order.status === 'completed' ? 'bg-green-600 text-white' :
                      order.status === 'pending' ? 'bg-yellow-600 text-white' :
                      order.status === 'processing' ? 'bg-blue-600 text-white' :
                      order.status === 'failed' ? 'bg-red-600 text-white' :
                      'bg-gray-600 text-white'
                    }`}>
                      {order.status.toUpperCase()}
                    </div>

                    {order.order_type === 'usdt' ? (
                      <>
                        <div className="text-sm text-gray-400 mb-1 mt-3">Binance ID</div>
                        <div className="text-white font-mono">{order.binance_id || 'N/A'}</div>
                      </>
                    ) : (
                      <>
                        <div className="text-sm text-gray-400 mb-1 mt-3">Phone Number</div>
                        <div className="text-white">{order.phone_number || 'N/A'}</div>
                      </>
                    )}

                    <div className="text-sm text-gray-400 mb-1 mt-3">Amount</div>
                    <div className="text-white">
                      {order.order_type === 'usdt' ? `$${order.amount}` : `${order.amount.toLocaleString()} IQD`}
                    </div>
                    
                    <div className="text-sm text-gray-400 mb-1 mt-3">Points Cost</div>
                    <div className="text-white">{order.points_cost} SBR</div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-400 mb-1">Created</div>
                    <div className="text-white text-sm">{new Date(order.created_at).toLocaleString()}</div>

                    {order.admin_notes && (
                      <>
                        <div className="text-sm text-gray-400 mb-1 mt-3">Notes</div>
                        <div className="text-white text-sm">{order.admin_notes}</div>
                      </>
                    )}

                    <div className="mt-4 space-y-2">
                      {order.status === 'pending' && (
                        <>
                          <button
                            onClick={() => updateOrderStatus(order.id, 'processing')}
                            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold"
                          >
                            Mark Processing
                          </button>
                          <button
                            onClick={() => {
                              const notes = prompt('Enter completion notes (optional):');
                              updateOrderStatus(order.id, 'completed', notes || undefined);
                            }}
                            className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold"
                          >
                            Mark Completed
                          </button>
                          <button
                            onClick={() => {
                              const notes = prompt('Enter failure reason (optional):');
                              updateOrderStatus(order.id, 'failed', notes || undefined);
                            }}
                            className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold"
                          >
                            Mark Failed
                          </button>
                        </>
                      )}
                      {order.status === 'processing' && (
                        <>
                          <button
                            onClick={() => {
                              const notes = prompt('Enter completion notes (optional):');
                              updateOrderStatus(order.id, 'completed', notes || undefined);
                            }}
                            className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold"
                          >
                            Mark Completed
                          </button>
                          <button
                            onClick={() => {
                              const notes = prompt('Enter failure reason (optional):');
                              updateOrderStatus(order.id, 'failed', notes || undefined);
                            }}
                            className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold"
                          >
                            Mark Failed
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


