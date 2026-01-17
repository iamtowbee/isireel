import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import DocumentPicker from 'react-native-document-picker';
import TFLiteService from '../services/TFLiteService';
import type { TFLiteModel } from '../types/tflite';

const LocalModelsScreen = () => {
  const [models, setModels] = useState<TFLiteModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<TFLiteModel | null>(null);
  const [inputText, setInputText] = useState('');
  const [output, setOutput] = useState<string>('');
  const [inferenceTime, setInferenceTime] = useState<number>(0);

  const loadModels = async () => {
    setLoading(true);
    try {
      const loadedModels = await TFLiteService.getAllModels();
      setModels(loadedModels);
    } catch (error) {
      Alert.alert('Error', 'Failed to load models');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadModels();
    }, [])
  );

  const handleImportModel = async () => {
    try {
      const result = await DocumentPicker.pickSingle({
        type: [DocumentPicker.types.allFiles],
      });

      if (!result.uri.endsWith('.tflite')) {
        Alert.alert('Invalid File', 'Please select a .tflite file');
        return;
      }

      setLoading(true);

      // Import model
      const modelPath = await TFLiteService.importModel(
        result.uri,
        result.name || 'model.tflite'
      );

      // Get model info
      const info = await TFLiteService.getModelInfo(modelPath);

      // Save metadata
      const newModel: TFLiteModel = {
        id: Date.now().toString(),
        name: result.name || 'Unnamed Model',
        path: modelPath,
        size: result.size || 0,
        inputShape: info.inputShape,
        outputShape: info.outputShape,
        dateAdded: new Date(),
        type: 'other',
      };

      await TFLiteService.saveModel(newModel);
      Alert.alert('Success', 'Model imported successfully!');
      loadModels();
    } catch (error) {
      if (!DocumentPicker.isCancel(error)) {
        Alert.alert('Error', 'Failed to import model');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRunInference = async () => {
    if (!selectedModel) {
      Alert.alert('No Model', 'Please select a model first');
      return;
    }

    if (!inputText) {
      Alert.alert('No Input', 'Please enter input data');
      return;
    }

    try {
      setLoading(true);

      // Parse input (simplified - would need proper preprocessing)
      const inputData = inputText.split(',').map(Number);

      const result = await TFLiteService.runInference(
        selectedModel.path,
        inputData
      );

      setOutput(JSON.stringify(result.output, null, 2));
      setInferenceTime(result.inferenceTime);
      Alert.alert('Success', `Inference completed in ${result.inferenceTime.toFixed(2)}ms`);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : String(error));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteModel = (model: TFLiteModel) => {
    Alert.alert(
      'Delete Model',
      `Delete ${model.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await TFLiteService.deleteModel(model.id);
              if (selectedModel?.id === model.id) {
                setSelectedModel(null);
              }
              Alert.alert('Success', 'Model deleted');
              loadModels();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete model');
            }
          },
        },
      ]
    );
  };

  const renderModel = ({ item }: { item: TFLiteModel }) => (
    <TouchableOpacity
      style={[
        styles.modelCard,
        selectedModel?.id === item.id && styles.modelCardSelected,
      ]}
      onPress={() => setSelectedModel(item)}
    >
      <View style={styles.modelInfo}>
        <Text style={styles.modelName}>{item.name}</Text>
        <Text style={styles.modelDetail}>
          Input: {TFLiteService.formatShape(item.inputShape)}
        </Text>
        <Text style={styles.modelDetail}>
          Output: {TFLiteService.formatShape(item.outputShape)}
        </Text>
        <Text style={styles.modelSize}>
          {(item.size / 1024 / 1024).toFixed(2)} MB
        </Text>
      </View>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteModel(item)}
      >
        <Text style={styles.deleteButtonText}>🗑️</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Local TensorFlow Lite</Text>
        <Text style={styles.headerSubtitle}>Run AI models on-device</Text>
      </View>

      <TouchableOpacity
        style={styles.importButton}
        onPress={handleImportModel}
        disabled={loading}
      >
        <Text style={styles.importButtonText}>📁 Import .tflite Model</Text>
      </TouchableOpacity>

      <View style={styles.modelsSection}>
        <Text style={styles.sectionTitle}>Your Models ({models.length})</Text>
        <FlatList
          data={models}
          renderItem={renderModel}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.modelsList}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>📦 No models yet</Text>
              <Text style={styles.emptySubtext}>Import a .tflite file to get started</Text>
            </View>
          }
        />
      </View>

      {selectedModel && (
        <View style={styles.inferenceSection}>
          <Text style={styles.sectionTitle}>Run Inference</Text>
          <Text style={styles.selectedModel}>Model: {selectedModel.name}</Text>

          <TextInput
            style={styles.input}
            placeholder="Enter input (comma-separated numbers)"
            placeholderTextColor="#666"
            value={inputText}
            onChangeText={setInputText}
            multiline
          />

          <TouchableOpacity
            style={styles.runButton}
            onPress={handleRunInference}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.runButtonText}>▶️ Run Inference</Text>
            )}
          </TouchableOpacity>

          {output && (
            <View style={styles.outputContainer}>
              <Text style={styles.outputLabel}>
                Output ({inferenceTime.toFixed(2)}ms):
              </Text>
              <Text style={styles.outputText}>{output}</Text>
            </View>
          )}
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e1e1e',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#3c3c3c',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#d4d4d4',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#808080',
    marginTop: 4,
  },
  importButton: {
    backgroundColor: '#007acc',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  importButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modelsSection: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#d4d4d4',
    marginBottom: 12,
  },
  modelsList: {
    flexGrow: 1,
  },
  modelCard: {
    flexDirection: 'row',
    backgroundColor: '#252526',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4ec9b0',
  },
  modelCardSelected: {
    borderLeftColor: '#007acc',
    backgroundColor: '#2d2d30',
  },
  modelInfo: {
    flex: 1,
  },
  modelName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#d4d4d4',
    marginBottom: 4,
  },
  modelDetail: {
    fontSize: 12,
    color: '#808080',
    marginBottom: 2,
    fontFamily: 'monospace',
  },
  modelSize: {
    fontSize: 12,
    color: '#4ec9b0',
    marginTop: 4,
  },
  deleteButton: {
    padding: 8,
  },
  deleteButtonText: {
    fontSize: 20,
  },
  inferenceSection: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#3c3c3c',
    backgroundColor: '#252526',
  },
  selectedModel: {
    fontSize: 14,
    color: '#4ec9b0',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#3c3c3c',
    color: '#d4d4d4',
    borderRadius: 6,
    padding: 12,
    marginBottom: 12,
    fontSize: 14,
    minHeight: 60,
  },
  runButton: {
    backgroundColor: '#28a745',
    padding: 14,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 12,
  },
  runButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  outputContainer: {
    backgroundColor: '#3c3c3c',
    borderRadius: 6,
    padding: 12,
  },
  outputLabel: {
    fontSize: 14,
    color: '#4ec9b0',
    marginBottom: 8,
    fontWeight: '600',
  },
  outputText: {
    fontSize: 12,
    color: '#d4d4d4',
    fontFamily: 'monospace',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#d4d4d4',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#808080',
    textAlign: 'center',
  },
});

export default LocalModelsScreen;
