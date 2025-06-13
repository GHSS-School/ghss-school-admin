import { GitHubConfig, FolderItem, NoticeFile } from '../types';

class GitHubService {
  private config: GitHubConfig | null = null;

  setConfig(config: GitHubConfig) {
    this.config = config;
  }

  private getHeaders() {
    if (!this.config?.token) {
      throw new Error('GitHub token not configured');
    }
    return {
      'Authorization': `token ${this.config.token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    };
  }

  private getApiUrl(path: string) {
    if (!this.config) {
      throw new Error('GitHub config not set');
    }
    return `https://api.github.com/repos/${this.config.owner}/${this.config.repo}/contents/${path}`;
  }

  async fileExists(path: string): Promise<{ exists: boolean; sha?: string }> {
    try {
      const response = await fetch(this.getApiUrl(path), {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        return { exists: true, sha: data.sha };
      } else if (response.status === 404) {
        return { exists: false };
      } else {
        throw new Error('Failed to check file existence');
      }
    } catch (error) {
      console.error('Error checking file existence:', error);
      return { exists: false };
    }
  }

  async createFile(path: string, content: string, message: string) {
    try {
      // Check if file exists first
      const fileCheck = await this.fileExists(path);
      
      const body: any = {
        message,
        content: btoa(unescape(encodeURIComponent(content))),
      };

      // If file exists, include sha for update
      if (fileCheck.exists && fileCheck.sha) {
        body.sha = fileCheck.sha;
      }

      const response = await fetch(this.getApiUrl(path), {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create file');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating file:', error);
      throw error;
    }
  }

  async uploadBinaryFile(path: string, file: File, message: string) {
    try {
      // Check if file exists first
      const fileCheck = await this.fileExists(path);
      
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const base64Content = btoa(String.fromCharCode(...uint8Array));

      const body: any = {
        message,
        content: base64Content,
      };

      // If file exists, include sha for update
      if (fileCheck.exists && fileCheck.sha) {
        body.sha = fileCheck.sha;
      }

      const response = await fetch(this.getApiUrl(path), {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to upload file');
      }

      return await response.json();
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  async getFolderContents(folderPath: string): Promise<FolderItem[]> {
    try {
      const response = await fetch(this.getApiUrl(folderPath), {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        if (response.status === 404) {
          return [];
        }
        throw new Error('Failed to fetch folder contents');
      }

      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching folder contents:', error);
      return [];
    }
  }

  async getFileContent(filePath: string): Promise<string> {
    try {
      const response = await fetch(this.getApiUrl(filePath), {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch file content');
      }

      const data = await response.json();
      return atob(data.content);
    } catch (error) {
      console.error('Error fetching file content:', error);
      throw error;
    }
  }

  async getNotices(): Promise<NoticeFile[]> {
    try {
      const contents = await this.getFolderContents('Notices');
      const noticeFiles = contents.filter(item => 
        item.type === 'file' && item.name.endsWith('.txt')
      );

      const notices: NoticeFile[] = [];
      
      for (const file of noticeFiles) {
        try {
          const content = await this.getFileContent(file.path);
          const lines = content.split('\n');
          
          if (lines.length >= 4) {
            notices.push({
              name: file.name,
              path: file.path,
              sha: file.sha || '',
              title: lines[0] || '',
              date: lines[1] || '',
              category: lines[2] || '',
              pinned: lines[3] === 'true',
            });
          }
        } catch (error) {
          console.error(`Error reading notice file ${file.name}:`, error);
        }
      }

      return notices.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (error) {
      console.error('Error fetching notices:', error);
      return [];
    }
  }

  async deleteFile(path: string, sha: string, message: string) {
    try {
      const response = await fetch(this.getApiUrl(path), {
        method: 'DELETE',
        headers: this.getHeaders(),
        body: JSON.stringify({
          message,
          sha,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete file');
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }

  async deleteFolder(folderPath: string) {
    try {
      const contents = await this.getFolderContents(folderPath);
      
      // Delete all files in the folder
      for (const item of contents) {
        if (item.type === 'file' && item.sha) {
          await this.deleteFile(item.path, item.sha, `Delete ${item.name}`);
        } else if (item.type === 'dir') {
          // Recursively delete subdirectories
          await this.deleteFolder(item.path);
        }
      }
    } catch (error) {
      console.error('Error deleting folder:', error);
      throw error;
    }
  }

  generateNoticeId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `NOTICE-${timestamp}-${random}`.toUpperCase();
  }
}

export const githubService = new GitHubService();