export interface TFLiteModel {
  id: string;
  name: string;
  path: string;
  size: number;
  inputShape: number[];
  outputShape: number[];
  dateAdded: Date;
  type: 'image' | 'text' | 'audio' | 'other';
}

export interface InferenceResult {
  output: number[] | number[][];
  inferenceTime: number;
  confidence?: number;
}

export interface ModelInfo {
  inputTensorCount: number;
  outputTensorCount: number;
  inputShape: number[];
  outputShape: number[];
  inputType: string;
  outputType: string;
}
