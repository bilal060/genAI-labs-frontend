export interface ParameterRange {
  temperature: number[];
  top_p: number[];
  max_tokens: number;
}

export interface Response {
  text: string;
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
}

export interface Experiment {
  experiment_id: string;  // Changed from number to string for MongoDB ObjectId
  name: string;
  prompt: string;
  responses: Response[];
  response_count: number;
  created_at: string;
}

export interface ExperimentRequest {
  prompt: string;
  parameter_ranges: ParameterRange;
  experiment_name: string;
}
