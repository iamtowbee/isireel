import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

interface Stat {
  label: string;
  value: string;
  icon: string;
  color: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress?: number;
}

const StatsScreen = () => {
  const [sessionTime, setSessionTime] = useState(0);
  const [commandsRun, setCommandsRun] = useState(Math.floor(Math.random() * 50));
  const [neuronsActivated, setNeuronsActivated] = useState(Math.floor(Math.random() * 1000));

  useEffect(() => {
    const interval = setInterval(() => {
      setSessionTime((t) => t + 1);
      // Randomly increment stats for fun
      if (Math.random() > 0.7) {
        setCommandsRun((c) => c + 1);
      }
      if (Math.random() > 0.5) {
        setNeuronsActivated((n) => n + Math.floor(Math.random() * 10));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const stats: Stat[] = [
    {
      label: 'Session Time',
      value: formatTime(sessionTime),
      icon: 'time',
      color: '#00ff88',
    },
    {
      label: 'Commands Run',
      value: commandsRun.toString(),
      icon: 'terminal',
      color: '#ff69b4',
    },
    {
      label: 'Neurons Activated',
      value: neuronsActivated.toLocaleString(),
      icon: 'flash',
      color: '#ffd700',
    },
    {
      label: 'Models Trained',
      value: '42',
      icon: 'trophy',
      color: '#4ecdc4',
    },
    {
      label: 'AI Power Level',
      value: 'Over 9000!',
      icon: 'rocket',
      color: '#ff6b6b',
    },
    {
      label: 'Easter Eggs Found',
      value: `${Math.min(10, Math.floor(commandsRun / 5))}/10`,
      icon: 'gift',
      color: '#9b59b6',
    },
  ];

  const achievements: Achievement[] = [
    {
      id: '1',
      title: 'First Steps',
      description: 'Opened the app for the first time',
      icon: 'footsteps',
      unlocked: true,
    },
    {
      id: '2',
      title: 'Terminal Master',
      description: 'Run 10 terminal commands',
      icon: 'terminal',
      unlocked: commandsRun >= 10,
      progress: Math.min(100, (commandsRun / 10) * 100),
    },
    {
      id: '3',
      title: 'Neuron Tapper',
      description: 'Activate 500 neurons in Playground',
      icon: 'hand-left',
      unlocked: neuronsActivated >= 500,
      progress: Math.min(100, (neuronsActivated / 500) * 100),
    },
    {
      id: '4',
      title: 'Mock Master',
      description: 'Train a fake model in Mock Lab',
      icon: 'flask',
      unlocked: false,
      progress: 0,
    },
    {
      id: '5',
      title: 'Easter Egg Hunter',
      description: 'Find all 10 Easter eggs in Terminal',
      icon: 'search',
      unlocked: commandsRun >= 50,
      progress: Math.min(100, (Math.floor(commandsRun / 5) / 10) * 100),
    },
    {
      id: '6',
      title: 'Chatty Cathy',
      description: 'Send 20 messages in AI Chat',
      icon: 'chatbubbles',
      unlocked: false,
      progress: 15,
    },
    {
      id: '7',
      title: 'AI Enthusiast',
      description: 'Spend 1 hour in the app',
      icon: 'time',
      unlocked: sessionTime >= 3600,
      progress: Math.min(100, (sessionTime / 3600) * 100),
    },
    {
      id: '8',
      title: 'Tab Explorer',
      description: 'Visit all 8 tabs',
      icon: 'apps',
      unlocked: false,
      progress: 75,
    },
  ];

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Icon name="stats-chart" size={40} color="#00ff88" />
        <Text style={styles.title}>Your Stats</Text>
        <Text style={styles.subtitle}>Track your AI journey! 📊</Text>
      </View>

      {/* Stats Grid */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📈 Live Statistics</Text>
        <View style={styles.statsGrid}>
          {stats.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <Icon name={stat.icon} size={30} color={stat.color} />
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Progress Bars */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🎯 Progress to Next Level</Text>
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>AI Mastery</Text>
            <Text style={styles.progressPercent}>
              {Math.floor((sessionTime / 3600) * 100)}%
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.min(100, (sessionTime / 3600) * 100)}%` },
              ]}
            />
          </View>
          <Text style={styles.progressSubtext}>
            {3600 - sessionTime > 0
              ? `${3600 - sessionTime}s to next level`
              : 'MAX LEVEL! 🎉'}
          </Text>
        </View>

        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Command Expert</Text>
            <Text style={styles.progressPercent}>
              {Math.floor((commandsRun / 100) * 100)}%
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min(100, (commandsRun / 100) * 100)}%`,
                  backgroundColor: '#ff69b4',
                },
              ]}
            />
          </View>
          <Text style={styles.progressSubtext}>
            {100 - commandsRun > 0
              ? `${100 - commandsRun} commands to expert level`
              : 'EXPERT! 🏆'}
          </Text>
        </View>
      </View>

      {/* Achievements */}
      <View style={styles.section}>
        <View style={styles.achievementHeader}>
          <Text style={styles.sectionTitle}>🏆 Achievements</Text>
          <Text style={styles.achievementCount}>
            {unlockedCount}/{achievements.length}
          </Text>
        </View>

        {achievements.map((achievement) => (
          <View
            key={achievement.id}
            style={[
              styles.achievementCard,
              !achievement.unlocked && styles.achievementLocked,
            ]}
          >
            <View
              style={[
                styles.achievementIcon,
                achievement.unlocked && styles.achievementIconUnlocked,
              ]}
            >
              <Icon
                name={achievement.icon}
                size={30}
                color={achievement.unlocked ? '#ffd700' : '#666'}
              />
            </View>
            <View style={styles.achievementContent}>
              <Text
                style={[
                  styles.achievementTitle,
                  !achievement.unlocked && styles.achievementTitleLocked,
                ]}
              >
                {achievement.title}
              </Text>
              <Text style={styles.achievementDescription}>
                {achievement.description}
              </Text>
              {!achievement.unlocked && achievement.progress !== undefined && (
                <View style={styles.achievementProgress}>
                  <View style={styles.achievementProgressBar}>
                    <View
                      style={[
                        styles.achievementProgressFill,
                        { width: `${achievement.progress}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.achievementProgressText}>
                    {achievement.progress.toFixed(0)}%
                  </Text>
                </View>
              )}
            </View>
            {achievement.unlocked && (
              <Icon name="checkmark-circle" size={24} color="#00ff88" />
            )}
          </View>
        ))}
      </View>

      {/* Fun Quote */}
      <View style={styles.quoteCard}>
        <Icon name="chatbox-ellipses" size={24} color="#ff69b4" />
        <Text style={styles.quoteText}>
          "The best way to predict the future is to train an AI model on it!"
        </Text>
        <Text style={styles.quoteAuthor}>- Some AI Enthusiast, probably</Text>
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
    borderBottomColor: '#00ff88',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#00ff88',
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
    color: '#fff',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCard: {
    backgroundColor: '#1a1a1a',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#333',
    minWidth: '47%',
    alignItems: 'center',
    gap: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
  },
  progressCard: {
    backgroundColor: '#1a1a1a',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 10,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  progressPercent: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00ff88',
  },
  progressBar: {
    height: 10,
    backgroundColor: '#0a0a0a',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00ff88',
  },
  progressSubtext: {
    fontSize: 12,
    color: '#888',
    marginTop: 5,
  },
  achievementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  achievementCount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffd700',
  },
  achievementCard: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    padding: 15,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#00ff88',
    marginBottom: 10,
    gap: 12,
    alignItems: 'center',
  },
  achievementLocked: {
    borderColor: '#333',
    opacity: 0.6,
  },
  achievementIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#0a0a0a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  achievementIconUnlocked: {
    backgroundColor: '#2a2a0a',
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  achievementTitleLocked: {
    color: '#888',
  },
  achievementDescription: {
    fontSize: 14,
    color: '#888',
  },
  achievementProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  achievementProgressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#0a0a0a',
    borderRadius: 3,
    overflow: 'hidden',
  },
  achievementProgressFill: {
    height: '100%',
    backgroundColor: '#4ecdc4',
  },
  achievementProgressText: {
    fontSize: 12,
    color: '#888',
    width: 40,
    textAlign: 'right',
  },
  quoteCard: {
    backgroundColor: '#1a1a1a',
    margin: 15,
    padding: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ff69b4',
    alignItems: 'center',
    gap: 10,
  },
  quoteText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 24,
  },
  quoteAuthor: {
    fontSize: 14,
    color: '#888',
  },
  spacer: {
    height: 30,
  },
});

export default StatsScreen;
