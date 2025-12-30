import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DocumentPicker from 'react-native-document-picker';
import AITrainerService from '../services/AITrainerService';

const GUIScreen = () => {
  const [apiKey, setApiKey] = useState('');
  const [selectedFile, setSelectedFile] = useState<string>('');
  const [model, setModel] = useState('gpt-3.5-turbo');
  const [epochs, setEpochs] = useState('3');
  const [testModel, setTestModel] = useState('');
  const [testPrompt, setTestPrompt] = useState('');
  const [testResponse, setTestResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInitialize = async () => {
    if (!apiKey) {
      Alert.alert('Error', 'Please enter your OpenAI API key');
      return;
    }

    setLoading(true);
    try {
      await AITrainerService.initialize(apiKey);
      Alert.alert('Success', 'AI Trainer initialized!');
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : String(error));
    } finally {
      setLoading(false);
    }
  };

  const handleSelectFile = async () => {
    try {
      const result = await DocumentPicker.pickSingle({
        type: [DocumentPicker.types.allFiles],
      });
      setSelectedFile(result.uri);
      Alert.alert('File Selected', result.name || result.uri);
    } catch (error) {
      if (!DocumentPicker.isCancel(error)) {
        Alert.alert('Error', 'Failed to select file');
      }
    }
  };

  const handleStartTraining = async () => {
    if (!selectedFile || !model) {
      Alert.alert('Error', 'Please select a file and specify a model');
      return;
    }

    setLoading(true);
    try {
      const job = await AITrainerService.startTraining(
        selectedFile,
        model,
        parseInt(epochs) || 3
      );
      Alert.alert(
        'Training Started',
        `Job ID: ${job.id}\nModel: ${job.model}\nStatus: ${job.status}`
      );
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : String(error));
    } finally {
      setLoading(false);
    }
  };

  const handleTestModel = async () => {
    if (!testModel || !testPrompt) {
      Alert.alert('Error', 'Please enter both model ID and prompt');
      return;
    }

    setLoading(true);
    try {
      const response = await AITrainerService.testModel(testModel, testPrompt);
      setTestResponse(response);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : String(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Initialization Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Initialize</Text>
          <TextInput
            style={styles.input}
            placeholder="OpenAI API Key"
            placeholderTextColor="#666"
            value={apiKey}
            onChangeText={setApiKey}
            secureTextEntry
            autoCapitalize="none"
          />
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleInitialize}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Initialize</Text>
          </TouchableOpacity>
        </View>

        {/* Training Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Start Training</Text>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={handleSelectFile}
          >
            <Text style={styles.buttonText}>
              {selectedFile ? '✓ File Selected' : 'Select Training Data'}
            </Text>
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            placeholder="Model (e.g., gpt-3.5-turbo)"
            placeholderTextColor="#666"
            value={model}
            onChangeText={setModel}
            autoCapitalize="none"
          />

          <TextInput
            style={styles.input}
            placeholder="Epochs (default: 3)"
            placeholderTextColor="#666"
            value={epochs}
            onChangeText={setEpochs}
            keyboardType="number-pad"
          />

          <TouchableOpacity
            style={[styles.button, styles.successButton]}
            onPress={handleStartTraining}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Start Training</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Test Model Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Test Model</Text>

          <TextInput
            style={styles.input}
            placeholder="Fine-tuned Model ID"
            placeholderTextColor="#666"
            value={testModel}
            onChangeText={setTestModel}
            autoCapitalize="none"
          />

          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Enter test prompt..."
            placeholderTextColor="#666"
            value={testPrompt}
            onChangeText={setTestPrompt}
            multiline
            numberOfLines={3}
          />

          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleTestModel}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Test Model</Text>
            )}
          </TouchableOpacity>

          {testResponse ? (
            <View style={styles.responseContainer}>
              <Text style={styles.responseTitle}>Response:</Text>
              <Text style={styles.responseText}>{testResponse}</Text>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e1e1e',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#252526',
    borderRadius: 8,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#d4d4d4',
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#3c3c3c',
    color: '#d4d4d4',
    borderRadius: 6,
    padding: 12,
    marginBottom: 12,
    fontSize: 14,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  button: {
    borderRadius: 6,
    padding: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  primaryButton: {
    backgroundColor: '#007acc',
  },
  secondaryButton: {
    backgroundColor: '#5c5c5c',
  },
  successButton: {
    backgroundColor: '#28a745',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  responseContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#3c3c3c',
    borderRadius: 6,
  },
  responseTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4ec9b0',
    marginBottom: 8,
  },
  responseText: {
    fontSize: 13,
    color: '#d4d4d4',
    lineHeight: 20,
  },
});

export default GUIScreen;
