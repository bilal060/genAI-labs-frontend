'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { experimentApi } from '@/services/api';
import { ExperimentRequest, Experiment } from '@/types/experiment';
import { PlayIcon, CogIcon } from '@heroicons/react/24/outline';

interface ExperimentFormProps {
  onExperimentComplete: (experiment: Experiment) => void;
  setActiveTab: (tab: 'new' | 'history') => void;
}

export default function ExperimentForm({ onExperimentComplete, setActiveTab }: ExperimentFormProps) {
  const [formData, setFormData] = useState({
    prompt: '',
    experiment_name: '',
    temperature: { min: 0.1, max: 1.0, step: 0.1 },
    top_p: { min: 0.1, max: 1.0, step: 0.1 },
    max_tokens: 150,  // Reduced for faster generation
  });

  const createExperimentMutation = useMutation({
    mutationFn: experimentApi.createExperiment,
    onSuccess: (data) => {
      onExperimentComplete(data);
      setActiveTab('history');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.prompt.trim() || !formData.experiment_name.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    const temperatureValues = [];
    for (let i = formData.temperature.min; i <= formData.temperature.max; i += formData.temperature.step) {
      temperatureValues.push(Math.round(i * 10) / 10);
    }

    const topPValues = [];
    for (let i = formData.top_p.min; i <= formData.top_p.max; i += formData.top_p.step) {
      topPValues.push(Math.round(i * 10) / 10);
    }

    const request: ExperimentRequest = {
      prompt: formData.prompt,
      experiment_name: formData.experiment_name,
      parameter_ranges: {
        temperature: temperatureValues,
        top_p: topPValues,
        max_tokens: formData.max_tokens,
      },
    };

    createExperimentMutation.mutate(request);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center space-x-2 mb-6">
        <CogIcon className="h-6 w-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-slate-900">Create New Experiment</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="experiment_name" className="block text-sm font-medium text-slate-700 mb-2">
            Experiment Name *
          </label>
          <input
            type="text"
            id="experiment_name"
            value={formData.experiment_name}
            onChange={(e) => setFormData({ ...formData, experiment_name: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Creative Writing Analysis"
            required
          />
        </div>

        <div>
          <label htmlFor="prompt" className="block text-sm font-medium text-slate-700 mb-2">
            Prompt *
          </label>
          <textarea
            id="prompt"
            value={formData.prompt}
            onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
            rows={4}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your prompt here..."
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Temperature Range
            </label>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-slate-600 mb-1">Min: {formData.temperature.min}</label>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.1"
                  value={formData.temperature.min}
                  onChange={(e) => setFormData({
                    ...formData,
                    temperature: { ...formData.temperature, min: parseFloat(e.target.value) }
                  })}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">Max: {formData.temperature.max}</label>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.1"
                  value={formData.temperature.max}
                  onChange={(e) => setFormData({
                    ...formData,
                    temperature: { ...formData.temperature, max: parseFloat(e.target.value) }
                  })}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Top-p Range
            </label>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-slate-600 mb-1">Min: {formData.top_p.min}</label>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.1"
                  value={formData.top_p.min}
                  onChange={(e) => setFormData({
                    ...formData,
                    top_p: { ...formData.top_p, min: parseFloat(e.target.value) }
                  })}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">Max: {formData.top_p.max}</label>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.1"
                  value={formData.top_p.max}
                  onChange={(e) => setFormData({
                    ...formData,
                    top_p: { ...formData.top_p, max: parseFloat(e.target.value) }
                  })}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="max_tokens" className="block text-sm font-medium text-slate-700 mb-2">
            Max Tokens
          </label>
          <input
            type="number"
            id="max_tokens"
            value={formData.max_tokens}
            onChange={(e) => setFormData({ ...formData, max_tokens: parseInt(e.target.value) })}
            min="100"
            max="4000"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <button
          type="submit"
          disabled={createExperimentMutation.isPending}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-colors"
        >
          {createExperimentMutation.isPending ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Running Experiment...</span>
            </>
          ) : (
            <>
              <PlayIcon className="h-4 w-4" />
              <span>Run Experiment</span>
            </>
          )}
        </button>

        {createExperimentMutation.isError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {(() => {
              const error = createExperimentMutation.error as any;
              const errorMessage = error?.response?.data?.detail || error?.message || 'Failed to run experiment';
              
              if (errorMessage.includes('not initialized') || errorMessage.includes('ANTHROPIC_API_KEY')) {
                return (
                  <div>
                    <div className="font-semibold mb-2">🔑 Claude API Not Initialized</div>
                    <div className="text-sm">
                      Claude API key is missing or invalid. Please check your ANTHROPIC_API_KEY environment variable.
                    </div>
                  </div>
                );
              } else if (errorMessage.includes('OPENROUTER_API_KEY')) {
                return (
                  <div>
                    <div className="font-semibold mb-2">🔑 OpenRouter API Not Initialized</div>
                    <div className="text-sm">
                      OpenRouter API key is missing or invalid. Please check your OPENROUTER_API_KEY environment variable.
                    </div>
                  </div>
                );
              } else if (errorMessage.includes('Both') && errorMessage.includes('failed')) {
                return (
                  <div>
                    <div className="font-semibold mb-2">🔑 Both APIs Failed</div>
                    <div className="text-sm">
                      Both OpenRouter and Claude APIs failed. Please check your API keys.
                    </div>
                  </div>
                );
              } else if (errorMessage.includes('credit balance') || errorMessage.includes('too low')) {
                return (
                  <div>
                    <div className="font-semibold mb-2">💳 Claude API Credits Insufficient</div>
                    <div className="text-sm">
                      Your Claude API credit balance is too low. Please add credits to your Anthropic account.
                    </div>
                  </div>
                );
              } else if (errorMessage.includes('timeout')) {
                return (
                  <div>
                    <div className="font-semibold mb-2">⏱️ Request Timeout</div>
                    <div className="text-sm">The request took too long. Please try again with shorter prompts or fewer parameter combinations.</div>
                  </div>
                );
              } else {
                return <div>Error: {errorMessage}</div>;
              }
            })()}
          </div>
        )}
      </form>
    </div>
  );
}
