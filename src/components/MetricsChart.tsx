'use client';

import { Response } from '@/types/experiment';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface MetricsChartProps {
  responses: Response[];
}

export default function MetricsChart({ responses }: MetricsChartProps) {
  const chartData = responses.map((response, index) => ({
    index: index + 1,
    temperature: response.parameters.temperature,
    topP: response.parameters.top_p,
    overall: response.metrics.overall,
    completeness: response.metrics.completeness,
    coherence: response.metrics.coherence,
    creativity: response.metrics.creativity,
    relevance: response.metrics.relevance,
  }));

  interface ChartData {
    index: number;
    temperature: number;
    topP: number;
    overall: number;
    completeness: number;
    coherence: number;
    creativity: number;
    relevance: number;
  }

  interface TooltipProps {
    active?: boolean;
    payload?: Array<{ payload: ChartData }>;
  }

  const CustomTooltip = ({ active, payload }: TooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-slate-200 rounded-lg shadow-lg">
          <p className="font-medium">Response #{data.index}</p>
          <p className="text-sm text-slate-600">
            Temperature: {data.temperature}, Top-p: {data.topP}
          </p>
          <div className="mt-2 space-y-1">
            <p className="text-sm">Overall: <span className="font-medium">{data.overall.toFixed(3)}</span></p>
            <p className="text-sm">Completeness: <span className="font-medium">{data.completeness.toFixed(3)}</span></p>
            <p className="text-sm">Coherence: <span className="font-medium">{data.coherence.toFixed(3)}</span></p>
            <p className="text-sm">Creativity: <span className="font-medium">{data.creativity.toFixed(3)}</span></p>
            <p className="text-sm">Relevance: <span className="font-medium">{data.relevance.toFixed(3)}</span></p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-lg font-semibold text-slate-900 mb-4">Parameter vs Quality Analysis</h4>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                type="number" 
                dataKey="temperature" 
                name="Temperature"
                domain={[0, 1]}
                tickCount={6}
              />
              <YAxis 
                type="number" 
                dataKey="overall" 
                name="Overall Score"
                domain={[0, 1]}
                tickCount={6}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Scatter 
                dataKey="overall" 
                fill="#3b82f6" 
                name="Overall Score"
                r={6}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h5 className="text-md font-semibold text-slate-900 mb-3">Temperature vs Top-p</h5>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  type="number" 
                  dataKey="temperature" 
                  name="Temperature"
                  domain={[0, 1]}
                  tickCount={6}
                />
                <YAxis 
                  type="number" 
                  dataKey="topP" 
                  name="Top-p"
                  domain={[0, 1]}
                  tickCount={6}
                />
                <Tooltip content={<CustomTooltip />} />
                <Scatter 
                  dataKey="overall" 
                  fill="#10b981" 
                  name="Overall Score"
                  r={6}
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <h5 className="text-md font-semibold text-slate-900 mb-3">Quality Metrics Distribution</h5>
          <div className="space-y-3">
            {['completeness', 'coherence', 'creativity', 'relevance'].map((metric) => {
              const values = responses.map(r => r.metrics[metric as keyof typeof r.metrics] as number);
              const avg = values.reduce((a, b) => a + b, 0) / values.length;
              const max = Math.max(...values);
              const min = Math.min(...values);
              
              return (
                <div key={metric} className="bg-slate-50 p-3 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-slate-700 capitalize">{metric}</span>
                    <span className="text-sm text-slate-500">Avg: {avg.toFixed(3)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>Min: {min.toFixed(3)}</span>
                    <span>Max: {max.toFixed(3)}</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${avg * 100}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
