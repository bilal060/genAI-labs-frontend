'use client';

import { BeakerIcon, ClockIcon, ChartBarIcon } from '@heroicons/react/24/outline';

interface HeaderProps {
  activeTab: 'new' | 'history' | 'analytics';
  setActiveTab: (tab: 'new' | 'history' | 'analytics') => void;
}

export default function Header({ activeTab, setActiveTab }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-slate-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <BeakerIcon className="h-8 w-8 text-blue-600" />
            <h1 className="text-xl font-bold text-slate-900">LLM Lab</h1>
          </div>
          
          <nav className="flex space-x-1">
            <button
              onClick={() => setActiveTab('new')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'new'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              New Experiment
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
                activeTab === 'history'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ClockIcon className="h-4 w-4" />
              <span>History</span>
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
                activeTab === 'analytics'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ChartBarIcon className="h-4 w-4" />
              <span>Analytics</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}
