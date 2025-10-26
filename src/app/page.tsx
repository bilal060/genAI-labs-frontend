'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ExperimentForm from '@/components/ExperimentForm';
import ExperimentResults from '@/components/ExperimentResults';
import ExperimentHistory from '@/components/ExperimentHistory';
import Header from '@/components/Header';
import PerformanceMonitor from '@/components/PerformanceMonitor';
import AdvancedAnalytics from '@/components/AdvancedAnalytics';
import { Experiment } from '@/types/experiment';

const queryClient = new QueryClient();

export default function Home() {
  const [currentExperiment, setCurrentExperiment] = useState<Experiment | null>(null);
  const [activeTab, setActiveTab] = useState<'new' | 'history' | 'analytics'>('new');
  const [allExperiments, setAllExperiments] = useState<Experiment[]>([]);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Header activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <main className="container mx-auto px-4 py-6">
          {activeTab === 'new' ? (
            <div className="space-y-6">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-slate-900 mb-2">
                  LLM Lab
                </h1>
                <p className="text-base text-slate-600 max-w-2xl mx-auto">
                  Compare language model outputs across different parameter settings. 
                  Analyze how temperature, top_p, and token limits influence response quality.
                </p>
              </div>
              
              <ExperimentForm 
                onExperimentComplete={setCurrentExperiment}
                setActiveTab={setActiveTab}
              />
              
              {currentExperiment && (
                <ExperimentResults experiment={currentExperiment} />
              )}
            </div>
          ) : activeTab === 'analytics' ? (
            <AdvancedAnalytics experiments={allExperiments} />
          ) : (
            <ExperimentHistory onExperimentsUpdate={setAllExperiments} />
          )}
        </main>
        
        {/* Performance Monitor - always visible */}
        <PerformanceMonitor />
      </div>
    </QueryClientProvider>
  );
}