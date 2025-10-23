'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { experimentApi } from '@/services/api';
import { Experiment } from '@/types/experiment';
import { ClockIcon, TrashIcon, EyeIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

interface ExperimentHistoryProps {
  onExperimentsUpdate?: (experiments: Experiment[]) => void;
}

export default function ExperimentHistory({ onExperimentsUpdate }: ExperimentHistoryProps) {
  const [selectedExperiment, setSelectedExperiment] = useState<Experiment | null>(null);
  const [expandedResponses, setExpandedResponses] = useState<Set<number>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const responsesPerPage = 10;
  const queryClient = useQueryClient();

  const { data: experiments, isLoading, error } = useQuery({
    queryKey: ['experiments'],
    queryFn: experimentApi.getExperiments,
  });

  // Update parent component when experiments change
  React.useEffect(() => {
    if (experiments && onExperimentsUpdate) {
      onExperimentsUpdate(experiments);
    }
  }, [experiments, onExperimentsUpdate]);

  const deleteExperimentMutation = useMutation({
    mutationFn: experimentApi.deleteExperiment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiments'] });
    },
  });

  const toggleResponseExpansion = (index: number) => {
    const newExpanded = new Set(expandedResponses);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedResponses(newExpanded);
  };

  // Pagination functions
  const getTotalPages = () => {
    if (!selectedExperiment) return 0;
    return Math.ceil(selectedExperiment.responses.length / responsesPerPage);
  };

  const getCurrentPageResponses = () => {
    if (!selectedExperiment) return [];
    const startIndex = (currentPage - 1) * responsesPerPage;
    const endIndex = startIndex + responsesPerPage;
    return selectedExperiment.responses.slice(startIndex, endIndex);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setExpandedResponses(new Set()); // Clear expanded responses when changing pages
  };

  const handleExperimentSelect = (experiment: Experiment) => {
    setSelectedExperiment(experiment);
    setCurrentPage(1); // Reset to first page
    setExpandedResponses(new Set()); // Clear expanded responses
  };

  const exportExperimentToCSV = (experiment: Experiment) => {
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        Error loading experiments: {error.message}
      </div>
    );
  }

  if (!experiments || experiments.length === 0) {
    return (
      <div className="text-center py-12">
        <ClockIcon className="h-12 w-12 text-slate-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-900 mb-2">No experiments yet</h3>
        <p className="text-slate-500">Create your first experiment to see results here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <ClockIcon className="h-6 w-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-slate-900">Experiment History</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          {experiments.map((experiment) => (
            <div key={experiment.experiment_id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-1">
                    {experiment.name}
                  </h3>
                  <p className="text-sm text-slate-500 mb-2">
                    {new Date(experiment.created_at).toLocaleString()}
                  </p>
                  <div className="flex items-center space-x-4 mb-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {experiment.response_count} responses
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 line-clamp-2">
                    {experiment.prompt}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleExperimentSelect(experiment)}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="View details"
                  >
                    <EyeIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => exportExperimentToCSV(experiment)}
                    className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="Export CSV"
                  >
                    <ArrowDownTrayIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => deleteExperimentMutation.mutate(experiment.experiment_id)}
                    disabled={deleteExperimentMutation.isPending}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    title="Delete experiment"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="bg-slate-50 p-3 rounded-lg">
                  <div className="text-slate-500">Responses</div>
                  <div className="font-semibold text-slate-900">{experiment.responses.length}</div>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg">
                  <div className="text-slate-500">Avg Overall</div>
                  <div className="font-semibold text-slate-900">
                    {(experiment.responses.reduce((sum, r) => sum + r.metrics.overall, 0) / experiment.responses.length).toFixed(3)}
                  </div>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg">
                  <div className="text-slate-500">Best Score</div>
                  <div className="font-semibold text-slate-900">
                    {Math.max(...experiment.responses.map(r => r.metrics.overall)).toFixed(3)}
                  </div>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg">
                  <div className="text-slate-500">Worst Score</div>
                  <div className="font-semibold text-slate-900">
                    {Math.min(...experiment.responses.map(r => r.metrics.overall)).toFixed(3)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:sticky lg:top-6">
          {selectedExperiment ? (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-slate-900">Experiment Details</h4>
                <button
                  onClick={() => setSelectedExperiment(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h5 className="font-medium text-slate-700 mb-2">Prompt</h5>
                  <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
                    {selectedExperiment.prompt}
                  </p>
                </div>

                <div>
                  <h5 className="font-medium text-slate-700 mb-2">Experiment Info</h5>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <div className="text-slate-500">Total Responses</div>
                      <div className="font-semibold text-slate-900">{selectedExperiment.response_count}</div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <div className="text-slate-500">Created</div>
                      <div className="font-semibold text-slate-900">
                        {new Date(selectedExperiment.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h5 className="font-medium text-slate-700 mb-2">Parameter Ranges</h5>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <div className="text-slate-500">Temperature</div>
                      <div className="font-semibold">
                        {Math.min(...selectedExperiment.responses.map(r => r.parameters.temperature))} - {Math.max(...selectedExperiment.responses.map(r => r.parameters.temperature))}
                      </div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <div className="text-slate-500">Top-p</div>
                      <div className="font-semibold">
                        {Math.min(...selectedExperiment.responses.map(r => r.parameters.top_p))} - {Math.max(...selectedExperiment.responses.map(r => r.parameters.top_p))}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h5 className="font-medium text-slate-700 mb-2">Quality Metrics Summary</h5>
                  <div className="space-y-2">
                    {['completeness', 'coherence', 'creativity', 'relevance', 'overall'].map((metric) => {
                      const values = selectedExperiment.responses.map(r => r.metrics[metric as keyof typeof r.metrics] as number);
                      const avg = values.reduce((a, b) => a + b, 0) / values.length;
                      
                      return (
                        <div key={metric} className="flex justify-between items-center">
                          <span className="text-sm text-slate-600 capitalize">{metric}</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-24 bg-slate-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${avg * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium w-12 text-right">{avg.toFixed(3)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h5 className="font-medium text-slate-700">
                      All Responses ({selectedExperiment.response_count}) - Page {currentPage} of {getTotalPages()}
                    </h5>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setExpandedResponses(new Set(getCurrentPageResponses().map((_, i) => i)))}
                        className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                      >
                        Expand All
                      </button>
                      <button
                        onClick={() => setExpandedResponses(new Set())}
                        className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                      >
                        Collapse All
                      </button>
                    </div>
                  </div>
                  
                  {/* Pagination Controls */}
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handlePageChange(1)}
                        disabled={currentPage === 1}
                        className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        First
                      </button>
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Previous
                      </button>
                    </div>
                    
                    <div className="flex space-x-1">
                      {Array.from({ length: Math.min(5, getTotalPages()) }, (_, i) => {
                        const pageNum = Math.max(1, Math.min(getTotalPages() - 4, currentPage - 2)) + i;
                        if (pageNum > getTotalPages()) return null;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`px-2 py-1 text-xs rounded transition-colors ${
                              currentPage === pageNum
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === getTotalPages()}
                        className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Next
                      </button>
                      <button
                        onClick={() => handlePageChange(getTotalPages())}
                        disabled={currentPage === getTotalPages()}
                        className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Last
                      </button>
                    </div>
                  </div>

                  <div className="max-h-96 overflow-y-auto space-y-3">
                    {getCurrentPageResponses().map((response, index) => {
                      const globalIndex = (currentPage - 1) * responsesPerPage + index;
                      return (
                        <div key={globalIndex} className="bg-slate-50 p-3 rounded-lg border">
                          <div className="flex justify-between items-start mb-2">
                            <div className="text-xs text-slate-500">
                              Response #{globalIndex + 1} | Temp: {response.parameters.temperature} | Top-p: {response.parameters.top_p}
                            </div>
                            <div className="text-xs text-slate-500">
                              Overall: {response.metrics.overall.toFixed(3)}
                            </div>
                          </div>
                          <div 
                            className={`text-sm text-slate-700 mb-2 cursor-pointer hover:bg-slate-100 p-2 rounded transition-colors ${
                              expandedResponses.has(index) ? '' : 'line-clamp-3'
                            }`}
                            onClick={() => toggleResponseExpansion(index)}
                          >
                            {response.text}
                            <div className="text-xs text-blue-600 mt-1">
                              {expandedResponses.has(index) ? 'Click to collapse' : 'Click to expand'}
                            </div>
                          </div>
                          <div className="flex space-x-4 text-xs">
                            <span className="text-green-600">Completeness: {response.metrics.completeness.toFixed(3)}</span>
                            <span className="text-blue-600">Coherence: {response.metrics.coherence.toFixed(3)}</span>
                            <span className="text-purple-600">Creativity: {response.metrics.creativity.toFixed(3)}</span>
                            <span className="text-orange-600">Relevance: {response.metrics.relevance.toFixed(3)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200">
                  <button
                    onClick={() => exportExperimentToCSV(selectedExperiment)}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <ArrowDownTrayIcon className="h-4 w-4" />
                    <span>Export to CSV</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 rounded-lg p-6 text-center">
              <EyeIcon className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-500">Select an experiment to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
