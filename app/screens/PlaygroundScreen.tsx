import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');

interface Neuron {
  x: number;
  y: number;
  value: number;
  pulse: number;
}

const PlaygroundScreen = () => {
  const [neurons, setNeurons] = useState<Neuron[]>([]);
  const [score, setScore] = useState(0);
  const [isTraining, setIsTraining] = useState(false);
  const [epoch, setEpoch] = useState(0);
  const [accuracy, setAccuracy] = useState(0);

  // Initialize neural network
  useEffect(() => {
    const initNeurons = [];
    for (let i = 0; i < 20; i++) {
      initNeurons.push({
        x: Math.random() * (width - 60) + 30,
        y: Math.random() * 400 + 50,
        value: Math.random(),
        pulse: 0,
      });
    }
    setNeurons(initNeurons);
  }, []);

  // Animate neurons
  useEffect(() => {
    if (isTraining) {
      const interval = setInterval(() => {
        setNeurons((prev) =>
          prev.map((n) => ({
            ...n,
            value: Math.max(0, Math.min(1, n.value + (Math.random() - 0.5) * 0.2)),
            pulse: Math.random(),
          }))
        );
        setEpoch((e) => e + 1);
        setAccuracy((a) => Math.min(99.9, a + Math.random() * 2));
      }, 100);

      return () => clearInterval(interval);
    }
  }, [isTraining]);

  const startTraining = () => {
    setIsTraining(true);
    setEpoch(0);
    setAccuracy(0);
  };

  const stopTraining = () => {
    setIsTraining(false);
  };

  const tapNeuron = (index: number) => {
    const newNeurons = [...neurons];
    newNeurons[index].value = Math.random();
    newNeurons[index].pulse = 1;
    setNeurons(newNeurons);
    setScore(score + Math.floor(newNeurons[index].value * 100));
  };

  const getColor = (value: number) => {
    const r = Math.floor(value * 255);
    const b = Math.floor((1 - value) * 255);
    return `rgb(${r}, 100, ${b})`;
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Icon name="game-controller" size={40} color="#00ff88" />
        <Text style={styles.title}>AI Playground</Text>
      </View>

      {/* Score Display */}
      <View style={styles.scoreCard}>
        <View style={styles.scoreItem}>
          <Text style={styles.scoreLabel}>SCORE</Text>
          <Text style={styles.scoreValue}>{score}</Text>
        </View>
        <View style={styles.scoreItem}>
          <Text style={styles.scoreLabel}>EPOCH</Text>
          <Text style={styles.scoreValue}>{epoch}</Text>
        </View>
        <View style={styles.scoreItem}>
          <Text style={styles.scoreLabel}>ACCURACY</Text>
          <Text style={styles.scoreValue}>{accuracy.toFixed(1)}%</Text>
        </View>
      </View>

      {/* Training Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.button, isTraining && styles.buttonActive]}
          onPress={isTraining ? stopTraining : startTraining}
        >
          <Icon
            name={isTraining ? 'pause' : 'play'}
            size={20}
            color="#fff"
          />
          <Text style={styles.buttonText}>
            {isTraining ? 'Stop Training' : 'Start Training'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Neural Network Playground */}
      <View style={styles.playground}>
        <Text style={styles.playgroundTitle}>Tap neurons to activate!</Text>
        <View style={styles.neuralNet}>
          {neurons.map((neuron, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.neuron,
                {
                  left: neuron.x,
                  top: neuron.y,
                  backgroundColor: getColor(neuron.value),
                  transform: [{ scale: 1 + neuron.pulse * 0.3 }],
                },
              ]}
              onPress={() => tapNeuron(index)}
            >
              <Text style={styles.neuronText}>
                {Math.floor(neuron.value * 100)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Info Cards */}
      <View style={styles.infoSection}>
        <View style={styles.infoCard}>
          <Icon name="bulb" size={30} color="#ffd700" />
          <Text style={styles.infoTitle}>Interactive Learning</Text>
          <Text style={styles.infoText}>
            Watch neurons activate in real-time as the network learns!
          </Text>
        </View>

        <View style={styles.infoCard}>
          <Icon name="flash" size={30} color="#ff6b6b" />
          <Text style={styles.infoTitle}>Live Training</Text>
          <Text style={styles.infoText}>
            See accuracy improve with each epoch during training.
          </Text>
        </View>

        <View style={styles.infoCard}>
          <Icon name="trophy" size={30} color="#4ecdc4" />
          <Text style={styles.infoTitle}>Score Points</Text>
          <Text style={styles.infoText}>
            Tap neurons to activate them and increase your score!
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#00ff88',
  },
  scoreCard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#1a1a1a',
    marginHorizontal: 15,
    marginBottom: 15,
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#00ff88',
  },
  scoreItem: {
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 5,
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00ff88',
  },
  controls: {
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#007acc',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  buttonActive: {
    backgroundColor: '#ff6b6b',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  playground: {
    marginHorizontal: 15,
    marginBottom: 20,
  },
  playgroundTitle: {
    fontSize: 16,
    color: '#00ff88',
    textAlign: 'center',
    marginBottom: 10,
  },
  neuralNet: {
    height: 500,
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#333',
    position: 'relative',
  },
  neuron: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  neuronText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  infoSection: {
    padding: 15,
    gap: 15,
    marginBottom: 30,
  },
  infoCard: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 10,
    marginBottom: 5,
  },
  infoText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
});

export default PlaygroundScreen;
