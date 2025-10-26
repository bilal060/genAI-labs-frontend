/**
 * Advanced analytics component for deeper insights into LLM experiments
 */
import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ScatterChart, Scatter, ResponsiveContainer } from 'recharts';

interface Experiment {
  experiment_id: number | string;
  name: string;
  created_at: string;
  responses: Response[];
}

interface Response {
  parameters: {
    temperature: number;
    top_p: number;
    max_tokens: number;
  };
  metrics: {
    completeness: number;
    coherence: number;
    creativity: number;
    relevance: number;
    overall: number;
  };
  text: string;
}

interface AdvancedAnalyticsProps {
  experiments: Experiment[];
}

export default function AdvancedAnalytics({ experiments }: AdvancedAnalyticsProps) {
  const [selectedMetric, setSelectedMetric] = useState('overall');
  const [selectedExperiments, setSelectedExperiments] = useState<(number | string)[]>([]);
  const [showAllResponses, setShowAllResponses] = useState(true);

  // Process data for advanced analytics
  const processDataForAnalytics = (): Record<string, unknown>[] => {
    const data: Record<string, unknown>[] = [];
    
    experiments.forEach(experiment => {
      if (selectedExperiments.length === 0 || selectedExperiments.includes(experiment.experiment_id)) {
        const responses = experiment.responses || [];
        
        // Limit responses if not showing all
        const responsesToProcess = showAllResponses ? responses : responses.slice(0, 10);
        
        responsesToProcess.forEach((response: Response, index: number) => {
          data.push({
            experiment_id: experiment.experiment_id,
            experiment_name: experiment.name,
            response_index: index + 1,
            temperature: response.parameters.temperature,
            top_p: response.parameters.top_p,
            max_tokens: response.parameters.max_tokens,
            completeness: response.metrics.completeness,
            coherence: response.metrics.coherence,
            creativity: response.metrics.creativity,
            relevance: response.metrics.relevance,
            overall: response.metrics.overall,
            response_length: response.text.length,
            parameter_combo: `${response.parameters.temperature}/${response.parameters.top_p}`
          });
        });
      }
    });
    
    return data;
  };

  const analyticsData = processDataForAnalytics();

  // Calculate correlation data with unique keys and aggregation
  const correlationMap = new Map();
  
  analyticsData.forEach((item, index) => {
    const key = `${item.temperature}-${item.top_p}`;
    if (correlationMap.has(key)) {
      // Aggregate overlapping parameter combinations
      const existing = correlationMap.get(key);
      existing[selectedMetric] = (existing[selectedMetric] + item[selectedMetric]) / 2;
      existing.count = existing.count + 1;
    } else {
      correlationMap.set(key, {
        temperature: item.temperature,
        [selectedMetric]: item[selectedMetric],
        top_p: item.top_p,
        name: item.parameter_combo,
        count: 1,
        id: `point-${index}` // Unique ID for React keys
      });
    }
  });
  
  const correlationData = Array.from(correlationMap.values());

  // Group by experiment for trend analysis
  const trendData = experiments
    .filter(exp => selectedExperiments.length === 0 || selectedExperiments.includes(exp.experiment_id))
    .map(experiment => {
      const responses = experiment.responses || [];
      const avgMetric = responses.reduce((sum: number, res: Response) => sum + (res.metrics[selectedMetric as keyof typeof res.metrics] as number), 0) / responses.length;
      
      return {
        name: experiment.name,
        date: new Date(experiment.created_at).toLocaleDateString(),
        [selectedMetric]: avgMetric,
        response_count: responses.length
      };
    });

  const metrics = [
    { key: 'overall', label: 'Overall Score', color: '#3b82f6' },
    { key: 'completeness', label: 'Completeness', color: '#10b981' },
    { key: 'coherence', label: 'Coherence', color: '#f59e0b' },
    { key: 'creativity', label: 'Creativity', color: '#ef4444' },
    { key: 'relevance', label: 'Relevance', color: '#8b5cf6' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-slate-900">Advanced Analytics</h2>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="showAllResponses"
              checked={showAllResponses}
              onChange={(e) => setShowAllResponses(e.target.checked)}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="showAllResponses" className="text-sm text-slate-700">
              Show all responses (uncheck to limit to 10 per experiment)
            </label>
          </div>
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {metrics.map(metric => (
              <option key={metric.key} value={metric.key}>
                {metric.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Data Summary */}
      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
        <div className="text-sm text-blue-800">
          <strong>Data Summary:</strong> Showing {analyticsData.length} response{analyticsData.length !== 1 ? 's' : ''} 
          {!showAllResponses && analyticsData.length >= 10 && ' (limited to 10 per experiment)'}
          {showAllResponses && analyticsData.length > 0 && ' (all responses included)'}
          {selectedExperiments.length > 0 && ` from ${selectedExperiments.length} selected experiment${selectedExperiments.length !== 1 ? 's' : ''}`}
        </div>
      </div>

      {/* Experiment Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Select Experiments to Analyze
        </label>
        <div className="flex flex-wrap gap-2">
          {experiments.map(experiment => (
            <button
              key={experiment.experiment_id}
              onClick={() => {
                if (selectedExperiments.includes(experiment.experiment_id)) {
                  setSelectedExperiments(selectedExperiments.filter(id => id !== experiment.experiment_id));
                } else {
                  setSelectedExperiments([...selectedExperiments, experiment.experiment_id]);
                }
              }}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                selectedExperiments.includes(experiment.experiment_id)
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {experiment.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Parameter vs Performance Scatter Plot */}
        <div className="bg-slate-50 rounded-lg p-4">
          <h3 className="text-lg font-medium text-slate-900 mb-4">
            Parameter Impact Analysis
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart data={correlationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="temperature" 
                  name="Temperature"
                  type="number"
                  scale="linear"
                  domain={[0, 1]}
                />
                <YAxis 
                  dataKey={selectedMetric}
                  name={selectedMetric}
                  domain={[0, 1]}
                />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }}
                  formatter={(value, name, props) => {
                    const data = props.payload;
                    const numValue = typeof value === 'number' ? value : parseFloat(value as string);
                    return [
                      `${numValue?.toFixed(3)} (${data.count} experiments)`,
                      name
                    ];
                  }}
                  labelFormatter={(label, payload) => {
                    if (payload && payload[0]) {
                      const data = payload[0].payload;
                      return `Temp: ${data.temperature}, Top-p: ${data.top_p}`;
                    }
                    return label;
                  }}
                />
                <Scatter 
                  dataKey={selectedMetric} 
                  fill={metrics.find(m => m.key === selectedMetric)?.color || '#3b82f6'}
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Experiment Trend Analysis */}
        <div className="bg-slate-50 rounded-lg p-4">
          <h3 className="text-lg font-medium text-slate-900 mb-4">
            Experiment Trends
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 1]} />
                <Tooltip 
                  formatter={(value, name) => {
                    const numValue = typeof value === 'number' ? value : parseFloat(value as string);
                    return [numValue?.toFixed(3), name];
                  }}
                  labelFormatter={(label) => `Experiment: ${label}`}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey={selectedMetric} 
                  stroke={metrics.find(m => m.key === selectedMetric)?.color || '#3b82f6'}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-sm text-blue-600 font-medium">Total Responses</div>
          <div className="text-2xl font-bold text-blue-900">
            {analyticsData.length}
          </div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-sm text-green-600 font-medium">Avg {selectedMetric}</div>
          <div className="text-2xl font-bold text-green-900">
            {(analyticsData.reduce((sum, item) => sum + (item[selectedMetric] as number), 0) / analyticsData.length || 0).toFixed(3)}
          </div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="text-sm text-orange-600 font-medium">Best Score</div>
          <div className="text-2xl font-bold text-orange-900">
            {Math.max(...analyticsData.map(item => item[selectedMetric] as number), 0).toFixed(3)}
          </div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="text-sm text-purple-600 font-medium">Parameter Range</div>
          <div className="text-2xl font-bold text-purple-900">
            {analyticsData.length > 0 ? 
              `${Math.min(...analyticsData.map(item => item.temperature as number)).toFixed(1)}-${Math.max(...analyticsData.map(item => item.temperature as number)).toFixed(1)}` : 
              'N/A'
            }
          </div>
        </div>
      </div>
    </div>
  );
}
