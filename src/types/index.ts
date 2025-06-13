export interface Achievement {
  folderName: string;
  title: string;
  category: 'Achievements' | 'Activity';
  date: string;
  description: string;
  image: File | null;
}

export interface Notice {
  noticeId: string;
  title: string;
  date: string;
  pinned: boolean;
  category: 'General' | 'Urgent' | 'Meeting' | 'Event' | 'Announcement' | 'Holiday' | 'Training' | 'Other';
  content: string;
}

export interface Upload {
  folderName: string;
  title: string;
  date: string;
  description?: string;
  files: File[];
}

export interface Gallery {
  folderName: string;
  images: File[];
}

export interface GitHubConfig {
  token: string;
  owner: string;
  repo: string;
}

export interface FolderItem {
  name: string;
  path: string;
  type: 'file' | 'dir';
  sha?: string;
}

export interface NoticeFile {
  name: string;
  path: string;
  sha: string;
  title: string;
  date: string;
  category: string;
  pinned: boolean;
}