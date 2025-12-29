export interface IPAFile {
  id: string;
  name: string;
  version: string;
  bundleId: string;
  size: number;
  downloadDate: Date;
  localPath: string;
  githubUrl?: string;
  icon?: string;
}

export interface GitHubArtifact {
  id: number;
  name: string;
  size_in_bytes: number;
  created_at: string;
  archive_download_url: string;
  workflow_run: {
    id: number;
    head_branch: string;
    head_sha: string;
  };
}

export interface DownloadProgress {
  bytesWritten: number;
  contentLength: number;
  percent: number;
}
