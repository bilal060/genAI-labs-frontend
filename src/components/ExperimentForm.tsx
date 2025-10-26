'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { experimentApi } from '@/services/api';
import { ExperimentRequest, Experiment } from '@/types/experiment';
import { PlayIcon, CogIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

interface ExperimentFormProps {
  onExperimentComplete: (experiment: Experiment) => void;
  setActiveTab: (tab: 'new' | 'history') => void;
}

interface RangeSliderProps {
  label: string;
  minValue: number;
  maxValue: number;
  overallMin: number;
  overallMax: number;
  step: number;
  onMinChange: (value: number) => void;
  onMaxChange: (value: number) => void;
}

function RangeSlider({ label, minValue, maxValue, overallMin, overallMax, step, onMinChange, onMaxChange }: RangeSliderProps) {
  // Calculate if values are valid
  const isValid = minValue < maxValue;
  const currentRange = maxValue - minValue;
  
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700">
        {label}: {minValue} - {maxValue}
        {!isValid && (
          <span className="ml-2 text-xs text-red-600">(Invalid range)</span>
        )}
      </label>
      
      <div className="flex items-center space-x-3">
        {/* Min Slider */}
        <div className="flex-1 relative">
          <input
            type="range"
            min={overallMin}
            max={overallMax - step}
            step={step}
            value={minValue}
            onChange={(e) => {
              const newMin = parseFloat(e.target.value);
              onMinChange(newMin);
            }}
            className="w-full"
          />
          <div className="text-xs text-slate-500 mt-1 text-center">Min: {minValue}</div>
        </div>
        
        {/* Max Slider */}
        <div className="flex-1 relative">
          <input
            type="range"
            min={overallMin + step}
            max={overallMax}
            step={step}
            value={maxValue}
            onChange={(e) => {
              const newMax = parseFloat(e.target.value);
              onMaxChange(newMax);
            }}
            className="w-full"
          />
          <div className="text-xs text-slate-500 mt-1 text-center">Max: {maxValue}</div>
        </div>
      </div>
      
      {!isValid && (
        <div className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
          Min value ({minValue}) is greater than or equal to max value ({maxValue}). Please adjust the sliders.
        </div>
      )}
      
      {isValid && currentRange < 0.3 && (
        <div className="text-xs text-blue-600">
          Range: {currentRange.toFixed(1)} - This will generate {Math.ceil(currentRange / step + 1)} value(s)
        </div>
      )}
    </div>
  );
}

export default function ExperimentForm({ onExperimentComplete, setActiveTab }: ExperimentFormProps) {
  const [formData, setFormData] = useState({
    prompt: '',
    experiment_name: '',
    temperatureMin: 0.1,
    temperatureMax: 1.0,
    topPMin: 0.1,
    topPMax: 1.0,
    max_tokens: 500,
  });
  
  const [showInfo, setShowInfo] = useState(false);

  const createExperimentMutation = useMutation({
    mutationFn: experimentApi.createExperiment,
    onSuccess: (data) => {
      onExperimentComplete(data);
      setActiveTab('history');
    },
  });

  // Calculate if form is valid
  const isFormValid = 
    formData.prompt.trim() !== '' &&
    formData.experiment_name.trim() !== '' &&
    formData.temperatureMin < formData.temperatureMax &&
    formData.topPMin < formData.topPMax;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.prompt.trim() || !formData.experiment_name.trim()) {
      alert('Please fill in all required fields');
      return;
    }
    
    // Validate ranges
    if (formData.temperatureMin >= formData.temperatureMax) {
      alert('Temperature min must be less than max');
      return;
    }
    
    if (formData.topPMin >= formData.topPMax) {
      alert('Top-p min must be less than max');
      return;
    }

    // Generate temperature values
    const temperatureValues = [];
    for (let i = formData.temperatureMin; i <= formData.temperatureMax; i += 0.1) {
      temperatureValues.push(Math.round(i * 10) / 10);
    }

    // Generate top-p values
    const topPValues = [];
    for (let i = formData.topPMin; i <= formData.topPMax; i += 0.1) {
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

      {/* Information Toggle Button */}
      <div className="flex justify-end mb-4">
        <button
          type="button"
          onClick={() => setShowInfo(!showInfo)}
          className="flex items-center space-x-2 px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <InformationCircleIcon className="h-5 w-5" />
          <span>{showInfo ? 'Hide' : 'Show'} Parameter Guide</span>
        </button>
      </div>

      {/* Parameter Explanation Table */}
      {showInfo && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-3 flex items-center space-x-2">
            <InformationCircleIcon className="h-5 w-5" />
            <span>Understanding Parameters</span>
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-blue-300">
                  <th className="px-3 py-2 font-semibold text-blue-900">Parameter</th>
                  <th className="px-3 py-2 font-semibold text-blue-900">Range</th>
                  <th className="px-3 py-2 font-semibold text-blue-900">Effect</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-blue-200">
                  <td className="px-3 py-2 font-medium">Temperature</td>
                  <td className="px-3 py-2">0.1 - 1.0</td>
                  <td className="px-3 py-2">Controls randomness: Lower = predictable, Higher = creative</td>
                </tr>
                <tr className="border-b border-blue-200">
                  <td className="px-3 py-2 font-medium">Top-p</td>
                  <td className="px-3 py-2">0.1 - 1.0</td>
                  <td className="px-3 py-2">Controls diversity: Lower = focused, Higher = diverse</td>
                </tr>
                <tr>
                  <td className="px-3 py-2 font-medium">Max Tokens</td>
                  <td className="px-3 py-2">100 - 4000</td>
                  <td className="px-3 py-2">Maximum response length: Lower = concise, Higher = detailed</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

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

        {/* Temperature Range Slider */}
        <RangeSlider
          label="Temperature Range"
          minValue={formData.temperatureMin}
          maxValue={formData.temperatureMax}
          overallMin={0.1}
          overallMax={1.0}
          step={0.1}
          onMinChange={(value) => setFormData({ ...formData, temperatureMin: value })}
          onMaxChange={(value) => setFormData({ ...formData, temperatureMax: value })}
        />

        {/* Top-p Range Slider */}
        <RangeSlider
          label="Top-p Range"
          minValue={formData.topPMin}
          maxValue={formData.topPMax}
          overallMin={0.1}
          overallMax={1.0}
          step={0.1}
          onMinChange={(value) => setFormData({ ...formData, topPMin: value })}
          onMaxChange={(value) => setFormData({ ...formData, topPMax: value })}
        />

        {/* Max Tokens */}
        <div>
          <label htmlFor="max_tokens" className="block text-sm font-medium text-slate-700 mb-2">
            Max Tokens: {formData.max_tokens}
          </label>
          <input
            type="range"
            id="max_tokens"
            min="500"
            max="4000"
            step="100"
            value={formData.max_tokens}
            onChange={(e) => setFormData({ ...formData, max_tokens: parseInt(e.target.value) })}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>500 (Minimum)</span>
            <span>4000 (Maximum)</span>
          </div>
        </div>

        {/* Calculated Combinations Info */}
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
          <div className="text-sm text-slate-600">
            <strong>Will generate:</strong>{' '}
            {Math.ceil((formData.temperatureMax - formData.temperatureMin) / 0.1 + 1) * 
             Math.ceil((formData.topPMax - formData.topPMin) / 0.1 + 1)} response(s)
          </div>
        </div>

        <button
          type="submit"
          disabled={createExperimentMutation.isPending || !isFormValid}
          title={!isFormValid && !createExperimentMutation.isPending ? 'Please fix invalid ranges before running experiment' : ''}
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

        {!isFormValid && (
          <div className="text-xs text-slate-500 text-center mt-2">
            {formData.temperatureMin >= formData.temperatureMax && "Temperature range is invalid. "}
            {formData.topPMin >= formData.topPMax && "Top-p range is invalid. "}
            Please adjust the sliders to enable the experiment.
          </div>
        )}

        {createExperimentMutation.isError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {(() => {
              const error = createExperimentMutation.error as { response?: { data?: { detail?: string } }; message?: string } | null;
              const errorMessage = error?.response?.data?.detail || error?.message || 'Failed to run experiment';
              
              if (errorMessage.includes('not initialized') || errorMessage.includes('ANTHROPIC_API_KEY')) {
                return (
                  <div>
                    <div className="font-semibold mb-2">API Not Initialized</div>
                    <div className="text-sm">
                      Claude API key is missing or invalid. Please check your environment variables.
                    </div>
                  </div>
                );
              } else if (errorMessage.includes('OPENROUTER_API_KEY')) {
                return (
                  <div>
                    <div className="font-semibold mb-2">OpenRouter API Not Initialized</div>
                    <div className="text-sm">
                      OpenRouter API key is missing or invalid. Please check your environment variables.
                    </div>
                  </div>
                );
              } else if (errorMessage.includes('Both') && errorMessage.includes('failed')) {
                return (
                  <div>
                    <div className="font-semibold mb-2">Both APIs Failed</div>
                    <div className="text-sm">
                      Both OpenRouter and Claude APIs failed. Please check your API keys.
                    </div>
                  </div>
                );
              } else if (errorMessage.includes('credit balance') || errorMessage.includes('too low')) {
                return (
                  <div>
                    <div className="font-semibold mb-2">API Credits Insufficient</div>
                    <div className="text-sm">
                      Your API credit balance is too low. Please add credits to your account.
                    </div>
                  </div>
                );
              } else if (errorMessage.includes('timeout')) {
                return (
                  <div>
                    <div className="font-semibold mb-2">Request Timeout</div>
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
