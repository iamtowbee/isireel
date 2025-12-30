import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import AITrainerService from '../services/AITrainerService';
import type { TrainingJob } from '../types';

const JobsScreen = () => {
  const [jobs, setJobs] = useState<TrainingJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadJobs = async () => {
    if (!AITrainerService.isInitialized()) {
      return;
    }

    setLoading(true);
    try {
      const fetchedJobs = await AITrainerService.listJobs();
      setJobs(fetchedJobs);
    } catch (error) {
      Alert.alert('Error', 'Failed to load jobs. Make sure you\'re initialized.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadJobs();
    }, [])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadJobs();
  };

  const handleCheckStatus = async (jobId: string) => {
    try {
      const job = await AITrainerService.getJobStatus(jobId);
      Alert.alert(
        'Job Status',
        `Job ID: ${job.id}\nModel: ${job.model}\nStatus: ${job.status}\n${
          job.fine_tuned_model ? `\nFine-tuned Model: ${job.fine_tuned_model}` : ''
        }${job.error ? `\nError: ${job.error}` : ''}`
      );
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : String(error));
    }
  };

  const handleCancelJob = async (jobId: string) => {
    Alert.alert(
      'Cancel Job',
      'Are you sure you want to cancel this training job?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: async () => {
            try {
              await AITrainerService.cancelJob(jobId);
              Alert.alert('Success', 'Job cancelled');
              loadJobs();
            } catch (error) {
              Alert.alert('Error', error instanceof Error ? error.message : String(error));
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'succeeded':
        return '#28a745';
      case 'running':
        return '#007acc';
      case 'queued':
        return '#ffc107';
      case 'failed':
        return '#dc3545';
      case 'cancelled':
        return '#6c757d';
      default:
        return '#d4d4d4';
    }
  };

  const renderJob = ({ item }: { item: TrainingJob }) => (
    <View style={styles.jobCard}>
      <View style={styles.jobHeader}>
        <Text style={styles.jobId} numberOfLines={1}>
          {item.id}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>

      <Text style={styles.jobModel}>Model: {item.model}</Text>
      <Text style={styles.jobDate}>
        Created: {new Date(item.created_at).toLocaleString()}
      </Text>

      {item.fine_tuned_model && (
        <Text style={styles.fineTunedModel} numberOfLines={1}>
          Fine-tuned: {item.fine_tuned_model}
        </Text>
      )}

      <View style={styles.jobActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.checkButton]}
          onPress={() => handleCheckStatus(item.id)}
        >
          <Text style={styles.actionButtonText}>Check Status</Text>
        </TouchableOpacity>

        {(item.status === 'running' || item.status === 'queued') && (
          <TouchableOpacity
            style={[styles.actionButton, styles.cancelButton]}
            onPress={() => handleCancelJob(item.id)}
          >
            <Text style={styles.actionButtonText}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  if (loading && jobs.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007acc" />
        <Text style={styles.loadingText}>Loading jobs...</Text>
      </View>
    );
  }

  if (!AITrainerService.isInitialized()) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>Please initialize AI Trainer first</Text>
        <Text style={styles.emptySubtext}>Go to Terminal or GUI tab to initialize</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={jobs}
        renderItem={renderJob}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#007acc"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No training jobs found</Text>
            <Text style={styles.emptySubtext}>Start a training job to see it here</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e1e1e',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1e1e1e',
  },
  listContent: {
    padding: 16,
  },
  jobCard: {
    backgroundColor: '#252526',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#007acc',
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  jobId: {
    flex: 1,
    fontSize: 12,
    color: '#4ec9b0',
    fontFamily: 'monospace',
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  jobModel: {
    fontSize: 14,
    color: '#d4d4d4',
    marginBottom: 4,
  },
  jobDate: {
    fontSize: 12,
    color: '#808080',
    marginBottom: 4,
  },
  fineTunedModel: {
    fontSize: 12,
    color: '#28a745',
    marginTop: 8,
    fontFamily: 'monospace',
  },
  jobActions: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  checkButton: {
    backgroundColor: '#007acc',
  },
  cancelButton: {
    backgroundColor: '#dc3545',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#d4d4d4',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#808080',
  },
  loadingText: {
    fontSize: 14,
    color: '#d4d4d4',
    marginTop: 12,
  },
});

export default JobsScreen;
