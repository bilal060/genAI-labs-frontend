'use client';

import { useState } from 'react';
import { Experiment, Response } from '@/types/experiment';
import { ChartBarIcon, EyeIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import MetricsChart from './MetricsChart';
import ResponseCard from './ResponseCard';

interface ExperimentResultsProps {
  experiment: Experiment;
}

export default function ExperimentResults({ experiment }: ExperimentResultsProps) {
  const [selectedResponse, setSelectedResponse] = useState<Response | null>(null);
  const [sortBy, setSortBy] = useState<'overall' | 'completeness' | 'coherence' | 'creativity' | 'relevance'>('overall');

  const sortedResponses = [...experiment.responses].sort((a, b) => 
    b.metrics[sortBy] - a.metrics[sortBy]
  );

  const exportToCSV = () => {
    const headers = ['Temperature', 'Top-p', 'Max Tokens', 'Completeness', 'Coherence', 'Creativity', 'Relevance', 'Overall', 'Response Text'];
    const rows = experiment.responses.map(response => [
      response.parameters.temperature,
      response.parameters.top_p,
      response.parameters.max_tokens,
      response.metrics.completeness,
      response.metrics.coherence,
      response.metrics.creativity,
      response.metrics.relevance,
      response.metrics.overall,
      `"${response.text.replace(/"/g, '""')}"` // Escape quotes in CSV
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${experiment.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_results.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <ChartBarIcon className="h-6 w-6 text-green-600" />
            <h2 className="text-2xl font-bold text-slate-900">Experiment Results</h2>
          </div>
          <button
            onClick={exportToCSV}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <ArrowDownTrayIcon className="h-4 w-4" />
            <span>Export CSV</span>
          </button>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-2">{experiment.name}</h3>
          <p className="text-slate-600 mb-4">{experiment.prompt}</p>
          <div className="flex items-center space-x-4 text-sm text-slate-500">
            <span>{experiment.responses.length} responses generated</span>
            <span>•</span>
            <span>Created: {new Date(experiment.created_at).toLocaleString()}</span>
          </div>
        </div>

        <MetricsChart responses={experiment.responses} />
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-slate-900">Response Analysis</h3>
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-slate-700">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'overall' | 'completeness' | 'coherence' | 'creativity' | 'relevance')}
              className="px-3 py-1 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="overall">Overall Score</option>
              <option value="completeness">Completeness</option>
              <option value="coherence">Coherence</option>
              <option value="creativity">Creativity</option>
              <option value="relevance">Relevance</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            {sortedResponses.map((response, index) => (
              <ResponseCard
                key={index}
                response={response}
                index={index + 1}
                isSelected={selectedResponse === response}
                onClick={() => setSelectedResponse(response)}
              />
            ))}
          </div>

          <div className="lg:sticky lg:top-6">
            {selectedResponse ? (
              <div className="bg-slate-50 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-slate-900">Response Details</h4>
                  <button
                    onClick={() => setSelectedResponse(null)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h5 className="font-medium text-slate-700 mb-2">Parameters</h5>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="bg-white p-3 rounded-lg">
                        <div className="text-slate-500">Temperature</div>
                        <div className="font-semibold">{selectedResponse.parameters.temperature}</div>
                      </div>
                      <div className="bg-white p-3 rounded-lg">
                        <div className="text-slate-500">Top-p</div>
                        <div className="font-semibold">{selectedResponse.parameters.top_p}</div>
                      </div>
                      <div className="bg-white p-3 rounded-lg">
                        <div className="text-slate-500">Max Tokens</div>
                        <div className="font-semibold">{selectedResponse.parameters.max_tokens}</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium text-slate-700 mb-2">Quality Metrics</h5>
                    <div className="space-y-2">
                      {Object.entries(selectedResponse.metrics).map(([key, value]) => (
                        <div key={key} className="flex justify-between items-center">
                          <span className="text-sm text-slate-600 capitalize">{key}</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-24 bg-slate-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${value * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium w-12 text-right">{value.toFixed(3)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium text-slate-700 mb-2">Response Text</h5>
                    <div className="bg-white p-4 rounded-lg text-sm text-slate-700 max-h-64 overflow-y-auto">
                      {selectedResponse.text}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 rounded-lg p-6 text-center">
                <EyeIcon className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-500">Click on a response to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
