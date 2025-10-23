import axios from 'axios';
import { Experiment, ExperimentRequest } from '@/types/experiment';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://genai-labs-backend.onrender.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const experimentApi = {
  createExperiment: async (data: ExperimentRequest): Promise<Experiment> => {
    const response = await api.post('/api/experiment', data);
    const exp = response.data;
    return { ...exp, experiment_id: exp.experiment_id ?? exp.id } as Experiment;
  },

  getExperiments: async (): Promise<Experiment[]> => {
    const response = await api.get('/api/experiments');
    const list = response.data as any[];
    return list.map((exp) => ({
      ...exp,
      experiment_id: exp.experiment_id ?? exp.id,
    })) as Experiment[];
  },

  getExperiment: async (id: string): Promise<Experiment> => {
    const response = await api.get(`/api/experiment/${id}`);
    const exp = response.data;
    return { ...exp, experiment_id: exp.experiment_id ?? exp.id } as Experiment;
  },

  deleteExperiment: async (id: string): Promise<void> => {
    await api.delete(`/api/experiment/${id}`);
  },
};

export default api;
