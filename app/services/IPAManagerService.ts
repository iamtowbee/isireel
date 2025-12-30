import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';
import { Linking, Alert } from 'react-native';
import type { IPAFile, GitHubArtifact, DownloadProgress } from '../types/ipa';

const IPA_STORAGE_KEY = 'installed_ipas';
const IPA_DIR = `${RNFS.DocumentDirectoryPath}/IPAs`;

class IPAManagerService {
  constructor() {
    this.ensureDirectory();
  }

  private async ensureDirectory() {
    const exists = await RNFS.exists(IPA_DIR);
    if (!exists) {
      await RNFS.mkdir(IPA_DIR);
    }
  }

  // Get GitHub Actions artifacts
  async fetchGitHubArtifacts(
    owner: string,
    repo: string,
    token?: string
  ): Promise<GitHubArtifact[]> {
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github+json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/actions/artifacts`,
      { headers }
    );

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.artifacts.filter((a: GitHubArtifact) =>
      a.name.includes('iOS') || a.name.includes('.ipa')
    );
  }

  // Download IPA from URL
  async downloadIPA(
    url: string,
    filename: string,
    onProgress?: (progress: DownloadProgress) => void
  ): Promise<string> {
    const downloadDest = `${IPA_DIR}/${filename}`;

    const download = RNFS.downloadFile({
      fromUrl: url,
      toFile: downloadDest,
      progress: (res) => {
        if (onProgress) {
          onProgress({
            bytesWritten: res.bytesWritten,
            contentLength: res.contentLength,
            percent: (res.bytesWritten / res.contentLength) * 100,
          });
        }
      },
    });

    const result = await download.promise;

    if (result.statusCode !== 200) {
      throw new Error(`Download failed with status ${result.statusCode}`);
    }

    return downloadDest;
  }

  // Save IPA metadata
  async saveIPAMetadata(ipa: IPAFile): Promise<void> {
    const existing = await this.getInstalledIPAs();
    const updated = [...existing.filter(i => i.id !== ipa.id), ipa];
    await AsyncStorage.setItem(IPA_STORAGE_KEY, JSON.stringify(updated));
  }

  // Get all installed IPAs
  async getInstalledIPAs(): Promise<IPAFile[]> {
    const data = await AsyncStorage.getItem(IPA_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  // Delete IPA
  async deleteIPA(id: string): Promise<void> {
    const ipas = await this.getInstalledIPAs();
    const ipa = ipas.find(i => i.id === id);

    if (ipa) {
      // Delete file
      const exists = await RNFS.exists(ipa.localPath);
      if (exists) {
        await RNFS.unlink(ipa.localPath);
      }

      // Remove from storage
      const updated = ipas.filter(i => i.id !== id);
      await AsyncStorage.setItem(IPA_STORAGE_KEY, JSON.stringify(updated));
    }
  }

  // Install via AltStore
  async installViaAltStore(ipaPath: string): Promise<void> {
    try {
      // AltStore URL scheme
      const url = `altstore://install?url=file://${ipaPath}`;

      const canOpen = await Linking.canOpenURL(url);

      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert(
          'AltStore Not Found',
          'Please install AltStore to sideload apps.\n\nVisit: altstore.io',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Open AltStore Website',
              onPress: () => Linking.openURL('https://altstore.io'),
            },
          ]
        );
      }
    } catch (error) {
      throw new Error(`Failed to open AltStore: ${error}`);
    }
  }

  // Install via Sideloadly (if available)
  async installViaSideloadly(ipaPath: string): Promise<void> {
    try {
      const url = `sideloadly://install?url=file://${ipaPath}`;
      const canOpen = await Linking.canOpenURL(url);

      if (canOpen) {
        await Linking.openURL(url);
      } else {
        throw new Error('Sideloadly not installed');
      }
    } catch (error) {
      throw new Error(`Failed to open Sideloadly: ${error}`);
    }
  }

  // Share IPA file
  async shareIPA(ipaPath: string): Promise<void> {
    const Share = require('react-native').Share;
    await Share.share({
      url: `file://${ipaPath}`,
      title: 'Share IPA',
    });
  }

  // Get IPA file size
  async getFileSize(path: string): Promise<number> {
    const stat = await RNFS.stat(path);
    return stat.size;
  }

  // Format file size
  formatSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  }
}

export default new IPAManagerService();
