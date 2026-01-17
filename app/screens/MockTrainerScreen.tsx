import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const FUNNY_MODELS = [
  '🧠 BrainDead-GPT',
  '🤪 Confused-AI-3000',
  '🎲 Random-Response-Model',
  '🍕 Pizza-Predictor-XL',
  '🦖 Dinosaur-Detector-Pro',
  '🎭 Drama-Queen-AI',
  '🤖 Sarcasm-Bot-v2',
  '🎪 Circus-ML-Deluxe',
];

const MOCK_RESPONSES = {
  'What is AI?': [
    'AI stands for "Absolutely Incredible" duh! 🙄',
    'AI = Artificially Insane. You\'re welcome.',
    'Artificial Intelligence, but make it ✨fabulous✨',
  ],
  'Tell me a joke': [
    'Why did the AI go to therapy? It had too many neural issues! 😂',
    'My code doesn\'t have bugs, it has "unexpected features"',
    'I told a chemistry joke but got no reaction... unlike neural networks!',
  ],
  'Hello': [
    'Sup human! Ready to waste some compute? 😎',
    'Oh great, another carbon-based life form...',
    'Hello! I\'m totally not planning world domination.',
  ],
  default: [
    'I have absolutely no idea what you just said, but I\'m pretending I do! 🤓',
    'My training data didn\'t prepare me for this nonsense.',
    '*AI confusion noises*',
    '404: Intelligence not found',
    'Let me consult my magic 8-ball... "Ask again later"',
  ],
};

const MockTrainerScreen = () => {
  const [selectedModel, setSelectedModel] = useState(FUNNY_MODELS[0]);
  const [isTraining, setIsTraining] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [testPrompt, setTestPrompt] = useState('');
  const [testResult, setTestResult] = useState('');
  const progressAnim = new Animated.Value(0);

  const FUNNY_LOGS = [
    '🔥 Setting random weights on fire...',
    '🎲 Rolling dice for gradient descent...',
    '🍕 Ordering pizza for neurons (they hungry)...',
    '🤔 Asking neurons if they even lift...',
    '💾 Downloading more RAM (not really)...',
    '🎮 Teaching AI to play Minecraft...',
    '🦄 Adding unicorn particles for +10 accuracy...',
    '🎯 Missing target by 99.9%... wait that\'s bad',
    '🧙 Casting machine learning spells...',
    '🎪 Training circus tricks into the model...',
    '🌈 Making loss curve pretty colors...',
    '💤 Waking up sleeping neurons...',
    '🎨 Painting gradients like Picasso...',
    '🚀 Launching neurons into space...',
    '⚡ Shocking model with electricity (it likes it)',
    '🎵 Teaching AI to drop beats...',
    '🍔 Backpropagating through hamburger layers...',
    '🏃 Making neurons do cardio...',
    '🎭 Training for Oscar-worthy predictions...',
    '✨ Sprinkling magic AI dust...',
  ];

  const startMockTraining = () => {
    setIsTraining(true);
    setProgress(0);
    setLogs([]);

    let currentProgress = 0;
    const interval = setInterval(() => {
      if (currentProgress >= 100) {
        clearInterval(interval);
        setIsTraining(false);
        setLogs((prev) => [
          ...prev,
          '🎉 Training complete! Model is now 100% more confused!',
          '📊 Final Accuracy: ' + (Math.random() * 100).toFixed(2) + '%',
          '🎯 Loss: ' + (Math.random() * 10).toFixed(4) + ' (lower is better... maybe?)',
        ]);
        return;
      }

      currentProgress += Math.random() * 15;
      if (currentProgress > 100) currentProgress = 100;
      setProgress(currentProgress);

      // Add random funny log
      const randomLog = FUNNY_LOGS[Math.floor(Math.random() * FUNNY_LOGS.length)];
      setLogs((prev) => [...prev, `[Epoch ${Math.floor(currentProgress / 10)}] ${randomLog}`]);
    }, 1000);
  };

  const testModel = (prompt: string) => {
    let responses = MOCK_RESPONSES.default;

    // Check for specific prompts
    for (const [key, value] of Object.entries(MOCK_RESPONSES)) {
      if (prompt.toLowerCase().includes(key.toLowerCase())) {
        responses = value;
        break;
      }
    }

    const response = responses[Math.floor(Math.random() * responses.length)];
    setTestResult(response);

    setTimeout(() => {
      setTestResult('');
    }, 5000);
  };

  const quickTests = [
    'What is AI?',
    'Tell me a joke',
    'Hello',
    'Are you intelligent?',
    'What is your purpose?',
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Icon name="flask" size={40} color="#ff69b4" />
        <Text style={styles.title}>Mock AI Lab</Text>
        <Text style={styles.subtitle}>Where AI goes to have fun! 🎉</Text>
      </View>

      {/* Model Selector */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Choose Your Fighter:</Text>
        <View style={styles.modelGrid}>
          {FUNNY_MODELS.map((model) => (
            <TouchableOpacity
              key={model}
              style={[
                styles.modelCard,
                selectedModel === model && styles.modelCardSelected,
              ]}
              onPress={() => setSelectedModel(model)}
            >
              <Text style={styles.modelText}>{model}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Training Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mock Training:</Text>
        <TouchableOpacity
          style={[styles.trainButton, isTraining && styles.trainButtonActive]}
          onPress={startMockTraining}
          disabled={isTraining}
        >
          <Icon name={isTraining ? 'timer' : 'rocket'} size={24} color="#fff" />
          <Text style={styles.trainButtonText}>
            {isTraining ? `Training... ${progress.toFixed(0)}%` : 'Start Fake Training'}
          </Text>
        </TouchableOpacity>

        {progress > 0 && (
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
        )}

        {/* Training Logs */}
        {logs.length > 0 && (
          <View style={styles.logsContainer}>
            <Text style={styles.logsTitle}>📜 Training Logs (totally legit):</Text>
            {logs.slice(-8).map((log, index) => (
              <Text key={index} style={styles.logText}>
                {log}
              </Text>
            ))}
          </View>
        )}
      </View>

      {/* Test Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Test Your "Trained" Model:</Text>
        <Text style={styles.helperText}>
          Current model: {selectedModel}
        </Text>

        <View style={styles.quickTestsContainer}>
          <Text style={styles.quickTestsTitle}>Quick Tests:</Text>
          {quickTests.map((test) => (
            <TouchableOpacity
              key={test}
              style={styles.quickTestButton}
              onPress={() => testModel(test)}
            >
              <Text style={styles.quickTestText}>{test}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {testResult && (
          <View style={styles.resultContainer}>
            <Icon name="chatbox-ellipses" size={24} color="#00ff88" />
            <Text style={styles.resultText}>{testResult}</Text>
          </View>
        )}
      </View>

      {/* Warning */}
      <View style={styles.warningBox}>
        <Icon name="warning" size={30} color="#ff6b6b" />
        <Text style={styles.warningText}>
          ⚠️ This is a MOCK trainer for entertainment purposes only!
          {'\n'}
          For real AI training, use the Terminal or GUI tabs.
          {'\n\n'}
          But let's be honest, this is way more fun! 😄
        </Text>
      </View>

      <View style={styles.spacer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#ff69b4',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ff69b4',
    marginTop: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    marginTop: 5,
  },
  section: {
    padding: 15,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00ff88',
    marginBottom: 15,
  },
  modelGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  modelCard: {
    backgroundColor: '#1a1a1a',
    padding: 15,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#333',
    minWidth: '45%',
    alignItems: 'center',
  },
  modelCardSelected: {
    borderColor: '#ff69b4',
    backgroundColor: '#2a1a2a',
  },
  modelText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  trainButton: {
    flexDirection: 'row',
    backgroundColor: '#ff69b4',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  trainButtonActive: {
    backgroundColor: '#9b59b6',
  },
  trainButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 20,
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    marginTop: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#333',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00ff88',
  },
  logsContainer: {
    backgroundColor: '#1a1a1a',
    padding: 15,
    borderRadius: 10,
    marginTop: 15,
    borderWidth: 1,
    borderColor: '#333',
  },
  logsTitle: {
    color: '#00ff88',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  logText: {
    color: '#d4d4d4',
    fontSize: 14,
    marginVertical: 3,
    fontFamily: 'monospace',
  },
  helperText: {
    color: '#888',
    fontSize: 14,
    marginBottom: 15,
  },
  quickTestsContainer: {
    marginTop: 10,
  },
  quickTestsTitle: {
    color: '#888',
    fontSize: 14,
    marginBottom: 10,
  },
  quickTestButton: {
    backgroundColor: '#1a1a1a',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  quickTestText: {
    color: '#00ff88',
    fontSize: 16,
  },
  resultContainer: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    padding: 15,
    borderRadius: 10,
    marginTop: 15,
    borderWidth: 2,
    borderColor: '#00ff88',
    gap: 10,
  },
  resultText: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    lineHeight: 24,
  },
  warningBox: {
    backgroundColor: '#2a1a1a',
    margin: 15,
    padding: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ff6b6b',
    alignItems: 'center',
  },
  warningText: {
    color: '#ff6b6b',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 20,
  },
  spacer: {
    height: 30,
  },
});

export default MockTrainerScreen;
