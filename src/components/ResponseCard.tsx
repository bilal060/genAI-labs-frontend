'use client';

import { Response } from '@/types/experiment';

interface ResponseCardProps {
  response: Response;
  index: number;
  isSelected: boolean;
  onClick: () => void;
}

export default function ResponseCard({ response, index, isSelected, onClick }: ResponseCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600 bg-green-100';
    if (score >= 0.6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div
      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
        isSelected
          ? 'border-blue-500 bg-blue-50'
          : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-slate-500">#{index}</span>
          <div className="flex space-x-1">
            <span className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded">
              T: {response.parameters.temperature}
            </span>
            <span className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded">
              P: {response.parameters.top_p}
            </span>
          </div>
        </div>
        <div className={`px-2 py-1 rounded text-sm font-medium ${getScoreColor(response.metrics.overall)}`}>
          {response.metrics.overall.toFixed(3)}
        </div>
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex justify-between text-xs">
          <span className="text-slate-500">Completeness</span>
          <span className="font-medium">{response.metrics.completeness.toFixed(3)}</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-1">
          <div
            className="bg-blue-600 h-1 rounded-full"
            style={{ width: `${response.metrics.completeness * 100}%` }}
          ></div>
        </div>

        <div className="flex justify-between text-xs">
          <span className="text-slate-500">Coherence</span>
          <span className="font-medium">{response.metrics.coherence.toFixed(3)}</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-1">
          <div
            className="bg-green-600 h-1 rounded-full"
            style={{ width: `${response.metrics.coherence * 100}%` }}
          ></div>
        </div>

        <div className="flex justify-between text-xs">
          <span className="text-slate-500">Creativity</span>
          <span className="font-medium">{response.metrics.creativity.toFixed(3)}</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-1">
          <div
            className="bg-purple-600 h-1 rounded-full"
            style={{ width: `${response.metrics.creativity * 100}%` }}
          ></div>
        </div>

        <div className="flex justify-between text-xs">
          <span className="text-slate-500">Relevance</span>
          <span className="font-medium">{response.metrics.relevance.toFixed(3)}</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-1">
          <div
            className="bg-orange-600 h-1 rounded-full"
            style={{ width: `${response.metrics.relevance * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="text-sm text-slate-600 line-clamp-3">
        {response.text}
      </div>
    </div>
  );
}
