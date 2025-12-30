import { NativeModules } from 'react-native';
import type { AITrainerModule, TrainingJob } from '../types';

const { AITrainer } = NativeModules as { AITrainer: AITrainerModule };

class AITrainerService {
  private apiKey: string = '';
  private initialized: boolean = false;

  async initialize(apiKey: string): Promise<void> {
    try {
      await AITrainer.initialize(apiKey);
      this.apiKey = apiKey;
      this.initialized = true;
    } catch (error) {
      throw new Error(`Failed to initialize AI Trainer: ${error}`);
    }
  }

  async startTraining(
    filePath: string,
    model: string,
    epochs: number = 3,
    batchSize?: number,
    learningRate?: number
  ): Promise<TrainingJob> {
    this.ensureInitialized();
    try {
      const result = await AITrainer.startTraining(
        filePath,
        model,
        epochs,
        batchSize,
        learningRate
      );
      return JSON.parse(result);
    } catch (error) {
      throw new Error(`Failed to start training: ${error}`);
    }
  }

  async getJobStatus(jobId: string): Promise<TrainingJob> {
    this.ensureInitialized();
    try {
      const result = await AITrainer.getJobStatus(jobId);
      return JSON.parse(result);
    } catch (error) {
      throw new Error(`Failed to get job status: ${error}`);
    }
  }

  async listJobs(): Promise<TrainingJob[]> {
    this.ensureInitialized();
    try {
      const result = await AITrainer.listJobs();
      return JSON.parse(result);
    } catch (error) {
      throw new Error(`Failed to list jobs: ${error}`);
    }
  }

  async cancelJob(jobId: string): Promise<TrainingJob> {
    this.ensureInitialized();
    try {
      const result = await AITrainer.cancelJob(jobId);
      return JSON.parse(result);
    } catch (error) {
      throw new Error(`Failed to cancel job: ${error}`);
    }
  }

  async testModel(model: string, prompt: string): Promise<string> {
    this.ensureInitialized();
    try {
      return await AITrainer.testModel(model, prompt);
    } catch (error) {
      throw new Error(`Failed to test model: ${error}`);
    }
  }

  async validateData(filePath: string): Promise<boolean> {
    this.ensureInitialized();
    try {
      const result = await AITrainer.validateData(filePath);
      return result.valid;
    } catch (error) {
      throw new Error(`Failed to validate data: ${error}`);
    }
  }

  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new Error('AI Trainer not initialized. Call initialize() first.');
    }
  }

  isInitialized(): boolean {
    return this.initialized;
  }
}

export default new AITrainerService();
