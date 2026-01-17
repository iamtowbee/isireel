import { NativeModules } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';
import type { TFLiteModel, InferenceResult, ModelInfo } from '../types/tflite';

const { TFLite } = NativeModules;

const MODEL_STORAGE_KEY = 'tflite_models';
const MODELS_DIR = `${RNFS.DocumentDirectoryPath}/TFLiteModels`;

class TFLiteService {
  constructor() {
    this.ensureDirectory();
  }

  private async ensureDirectory() {
    const exists = await RNFS.exists(MODELS_DIR);
    if (!exists) {
      await RNFS.mkdir(MODELS_DIR);
    }
  }

  // Load a TFLite model
  async loadModel(modelPath: string): Promise<boolean> {
    try {
      const result = await TFLite.loadModel(modelPath);
      return result.success;
    } catch (error) {
      throw new Error(`Failed to load model: ${error}`);
    }
  }

  // Run inference on the model
  async runInference(
    modelPath: string,
    inputData: number[] | number[][]
  ): Promise<InferenceResult> {
    try {
      const result = await TFLite.runInference(modelPath, inputData);
      return {
        output: result.output,
        inferenceTime: result.inferenceTime,
        confidence: this.calculateConfidence(result.output),
      };
    } catch (error) {
      throw new Error(`Inference failed: ${error}`);
    }
  }

  // Get model information
  async getModelInfo(modelPath: string): Promise<ModelInfo> {
    try {
      const info = await TFLite.getModelInfo(modelPath);
      return {
        inputTensorCount: 1,
        outputTensorCount: 1,
        inputShape: info.inputShape,
        outputShape: info.outputShape,
        inputType: info.inputType,
        outputType: info.outputType,
      };
    } catch (error) {
      throw new Error(`Failed to get model info: ${error}`);
    }
  }

  // Save model metadata
  async saveModel(model: TFLiteModel): Promise<void> {
    const models = await this.getAllModels();
    const updated = [...models.filter(m => m.id !== model.id), model];
    await AsyncStorage.setItem(MODEL_STORAGE_KEY, JSON.stringify(updated));
  }

  // Get all saved models
  async getAllModels(): Promise<TFLiteModel[]> {
    const data = await AsyncStorage.getItem(MODEL_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  // Delete a model
  async deleteModel(id: string): Promise<void> {
    const models = await this.getAllModels();
    const model = models.find(m => m.id === id);

    if (model) {
      // Delete file
      const exists = await RNFS.exists(model.path);
      if (exists) {
        await RNFS.unlink(model.path);
      }

      // Remove from storage
      const updated = models.filter(m => m.id !== id);
      await AsyncStorage.setItem(MODEL_STORAGE_KEY, JSON.stringify(updated));
    }
  }

  // Copy model to app directory
  async importModel(sourcePath: string, modelName: string): Promise<string> {
    const destPath = `${MODELS_DIR}/${modelName}`;
    await RNFS.copyFile(sourcePath, destPath);
    return destPath;
  }

  // Calculate confidence from output
  private calculateConfidence(output: number[] | number[][]): number {
    const flatOutput = Array.isArray(output[0]) ? output.flat() : output;
    return Math.max(...(flatOutput as number[]));
  }

  // Format tensor shape
  formatShape(shape: number[]): string {
    return `[${shape.join(', ')}]`;
  }

  // Prepare image data for model input
  async prepareImageInput(imagePath: string, targetSize: number[]): Promise<number[]> {
    // This would normally process the image
    // For now, return dummy data
    const [height, width, channels] = targetSize.slice(1);
    return new Array(height * width * channels).fill(0);
  }
}

export default new TFLiteService();
