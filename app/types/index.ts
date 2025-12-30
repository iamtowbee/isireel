export interface TrainingJob {
  id: string;
  model: string;
  status: 'queued' | 'running' | 'succeeded' | 'failed' | 'cancelled';
  created_at: string;
  training_file: string;
  hyperparameters: Hyperparameters;
  fine_tuned_model?: string;
  error?: string;
}

export interface Hyperparameters {
  n_epochs: number;
  batch_size?: number;
  learning_rate_multiplier?: number;
}

export interface CommandOutput {
  command: string;
  output: string;
  timestamp: number;
  success: boolean;
}

export interface AITrainerModule {
  initialize(apiKey: string): Promise<{success: boolean}>;
  startTraining(
    filePath: string,
    model: string,
    epochs: number,
    batchSize?: number,
    learningRate?: number
  ): Promise<string>;
  getJobStatus(jobId: string): Promise<string>;
  listJobs(): Promise<string>;
  cancelJob(jobId: string): Promise<string>;
  testModel(model: string, prompt: string): Promise<string>;
  validateData(filePath: string): Promise<{valid: boolean}>;
}
