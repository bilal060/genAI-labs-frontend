/**
 * Performance monitoring component for displaying API performance metrics
 */
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface PerformanceMetrics {
  api_calls: number;
  cache_hits: number;
  cache_misses: number;
  avg_response_time: number;
  cache_hit_rate: number;
}

export default function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        // Force HTTPS for production
        const getAPIBaseURL = () => {
          const envURL = process.env.NEXT_PUBLIC_API_URL;
          if (envURL) {
            return envURL.replace('http://', 'https://');
          }
          return 'https://genai-labs-backend.onrender.com';
        };
        
        const API_BASE_URL = getAPIBaseURL();
        const response = await fetch(`${API_BASE_URL}/api/performance`);
        if (response.ok) {
          const data = await response.json();
          setMetrics(data);
        }
      } catch (error) {
        console.error('Failed to fetch performance metrics:', error);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  if (!metrics) return null;

  const chartData = [
    { name: 'Cache Hits', value: metrics.cache_hits, color: '#10b981' },
    { name: 'Cache Misses', value: metrics.cache_misses, color: '#ef4444' },
  ];

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg transition-colors"
      >
        📊 Performance
      </button>

      {isVisible && (
        <div className="absolute bottom-16 right-0 bg-white rounded-lg shadow-xl border p-6 w-80">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Performance Metrics</h3>
            <button
              onClick={() => setIsVisible(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-3 rounded-lg">
                <div className="text-sm text-slate-500">API Calls</div>
                <div className="text-xl font-bold text-slate-900">{metrics.api_calls}</div>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg">
                <div className="text-sm text-slate-500">Avg Response</div>
                <div className="text-xl font-bold text-slate-900">
                  {metrics.avg_response_time.toFixed(2)}s
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg">
              <div className="text-sm text-slate-500 mb-2">Cache Hit Rate</div>
              <div className="flex items-center">
                <div className="flex-1 bg-slate-200 rounded-full h-2 mr-3">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${metrics.cache_hit_rate}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-slate-900">
                  {metrics.cache_hit_rate.toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
