import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import IPAManagerService from '../services/IPAManagerService';
import type { IPAFile } from '../types/ipa';

const IPAManagerScreen = () => {
  const [ipas, setIpas] = useState<IPAFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState('');
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);

  // GitHub settings
  const [githubOwner, setGithubOwner] = useState('iamtowbee');
  const [githubRepo, setGithubRepo] = useState('isireel');

  const loadIPAs = async () => {
    setLoading(true);
    try {
      const installedIPAs = await IPAManagerService.getInstalledIPAs();
      setIpas(installedIPAs);
    } catch (error) {
      Alert.alert('Error', 'Failed to load IPAs');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadIPAs();
    }, [])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadIPAs();
  };

  const handleDownloadFromGitHub = async () => {
    try {
      setLoading(true);
      const artifacts = await IPAManagerService.fetchGitHubArtifacts(
        githubOwner,
        githubRepo
      );

      if (artifacts.length === 0) {
        Alert.alert('No Builds Found', 'No IPA builds found in GitHub Actions');
        return;
      }

      // Show list of artifacts to download
      const artifactNames = artifacts.map((a, i) => ({
        text: `${a.name} (${IPAManagerService.formatSize(a.size_in_bytes)})`,
        onPress: () => downloadArtifact(a.archive_download_url, a.name),
      }));

      Alert.alert('Select Build', 'Choose a build to download:', [
        ...artifactNames,
        { text: 'Cancel', style: 'cancel' },
      ]);
    } catch (error) {
      Alert.alert('Error', `Failed to fetch builds: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const downloadArtifact = async (url: string, name: string) => {
    try {
      setIsDownloading(true);
      setDownloadProgress(0);

      const filename = `${name}_${Date.now()}.ipa`;
      const path = await IPAManagerService.downloadIPA(url, filename, (progress) => {
        setDownloadProgress(progress.percent);
      });

      const size = await IPAManagerService.getFileSize(path);

      const newIPA: IPAFile = {
        id: Date.now().toString(),
        name: name,
        version: '1.0.0',
        bundleId: 'unknown',
        size,
        downloadDate: new Date(),
        localPath: path,
        githubUrl: url,
      };

      await IPAManagerService.saveIPAMetadata(newIPA);
      Alert.alert('Success', 'IPA downloaded successfully!');
      loadIPAs();
    } catch (error) {
      Alert.alert('Error', `Download failed: ${error}`);
    } finally {
      setIsDownloading(false);
      setDownloadProgress(0);
    }
  };

  const handleInstall = (ipa: IPAFile) => {
    Alert.alert(
      'Install App',
      `Install ${ipa.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'AltStore',
          onPress: async () => {
            try {
              await IPAManagerService.installViaAltStore(ipa.localPath);
            } catch (error) {
              Alert.alert('Error', error instanceof Error ? error.message : String(error));
            }
          },
        },
        {
          text: 'Share',
          onPress: async () => {
            try {
              await IPAManagerService.shareIPA(ipa.localPath);
            } catch (error) {
              Alert.alert('Error', 'Failed to share IPA');
            }
          },
        },
      ]
    );
  };

  const handleDelete = (ipa: IPAFile) => {
    Alert.alert(
      'Delete IPA',
      `Delete ${ipa.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await IPAManagerService.deleteIPA(ipa.id);
              Alert.alert('Success', 'IPA deleted');
              loadIPAs();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete IPA');
            }
          },
        },
      ]
    );
  };

  const renderIPA = ({ item }: { item: IPAFile }) => (
    <View style={styles.ipaCard}>
      <View style={styles.ipaInfo}>
        <Text style={styles.ipaName}>{item.name}</Text>
        <Text style={styles.ipaVersion}>v{item.version}</Text>
        <Text style={styles.ipaSize}>{IPAManagerService.formatSize(item.size)}</Text>
        <Text style={styles.ipaDate}>
          {new Date(item.downloadDate).toLocaleDateString()}
        </Text>
      </View>

      <View style={styles.ipaActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.installButton]}
          onPress={() => handleInstall(item)}
        >
          <Text style={styles.actionButtonText}>Install</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDelete(item)}
        >
          <Text style={styles.actionButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>IPA Manager</Text>
        <Text style={styles.headerSubtitle}>Download & Install Apps</Text>
      </View>

      <View style={styles.actionBar}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleDownloadFromGitHub}
          disabled={loading}
        >
          <Text style={styles.primaryButtonText}>
            📦 Download from GitHub
          </Text>
        </TouchableOpacity>
      </View>

      {isDownloading && (
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            Downloading... {downloadProgress.toFixed(0)}%
          </Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${downloadProgress}%` }]} />
          </View>
        </View>
      )}

      <FlatList
        data={ipas}
        renderItem={renderIPA}
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
            <Text style={styles.emptyText}>📱 No IPAs Downloaded</Text>
            <Text style={styles.emptySubtext}>
              Tap "Download from GitHub" to get started
            </Text>
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
  actionBar: {
    padding: 16,
  },
  primaryButton: {
    backgroundColor: '#007acc',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  progressContainer: {
    padding: 16,
    backgroundColor: '#252526',
    marginHorizontal: 16,
    borderRadius: 8,
  },
  progressText: {
    color: '#d4d4d4',
    fontSize: 14,
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#3c3c3c',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007acc',
  },
  listContent: {
    padding: 16,
  },
  ipaCard: {
    backgroundColor: '#252526',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#007acc',
  },
  ipaInfo: {
    marginBottom: 12,
  },
  ipaName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#d4d4d4',
    marginBottom: 4,
  },
  ipaVersion: {
    fontSize: 14,
    color: '#4ec9b0',
    marginBottom: 2,
  },
  ipaSize: {
    fontSize: 12,
    color: '#808080',
  },
  ipaDate: {
    fontSize: 12,
    color: '#808080',
    marginTop: 4,
  },
  ipaActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  installButton: {
    backgroundColor: '#28a745',
  },
  deleteButton: {
    backgroundColor: '#dc3545',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
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

export default IPAManagerScreen;
