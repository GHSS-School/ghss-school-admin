import React, { useState, useEffect } from 'react';
import { Trash2, Folder, AlertTriangle, Loader2, RefreshCw, FileText, Calendar, Pin } from 'lucide-react';
import { FolderItem, NoticeFile } from '../types';
import { githubService } from '../services/githubService';

const MAIN_FOLDERS = ['Achievements', 'Uploads', 'Gallery'];

export default function FolderManager() {
  const [folders, setFolders] = useState<{ [key: string]: FolderItem[] }>({});
  const [notices, setNotices] = useState<NoticeFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadFolders = async () => {
    setIsLoading(true);
    try {
      const foldersData: { [key: string]: FolderItem[] } = {};
      
      for (const mainFolder of MAIN_FOLDERS) {
        const contents = await githubService.getFolderContents(mainFolder);
        foldersData[mainFolder] = contents.filter(item => item.type === 'dir');
      }
      
      setFolders(foldersData);
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: 'Failed to load folders' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadNotices = async () => {
    try {
      const noticesData = await githubService.getNotices();
      setNotices(noticesData);
    } catch (error) {
      console.error('Failed to load notices:', error);
    }
  };

  const deleteFolder = async (mainFolder: string, folderName: string, folderPath: string) => {
    if (!confirm(`Are you sure you want to delete the folder "${folderName}"? This action cannot be undone.`)) {
      return;
    }

    setDeleteLoading(folderPath);
    try {
      await githubService.deleteFolder(folderPath);
      setMessage({ type: 'success', text: `Folder "${folderName}" deleted successfully!` });
      await loadFolders(); // Reload folders
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to delete folder' 
      });
    } finally {
      setDeleteLoading(null);
    }
  };

  const deleteNotice = async (notice: NoticeFile) => {
    if (!confirm(`Are you sure you want to delete the notice "${notice.title}"? This action cannot be undone.`)) {
      return;
    }

    setDeleteLoading(notice.path);
    try {
      await githubService.deleteFile(notice.path, notice.sha, `Delete notice: ${notice.title}`);
      setMessage({ type: 'success', text: `Notice "${notice.title}" deleted successfully!` });
      await loadNotices(); // Reload notices
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to delete notice' 
      });
    } finally {
      setDeleteLoading(null);
    }
  };

  useEffect(() => {
    loadFolders();
    loadNotices();
  }, []);

  return (
    <div className="space-y-6">
      {/* Notices Management */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="text-blue-600" size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Notice Management</h2>
          </div>
          <button
            onClick={loadNotices}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <RefreshCw className={isLoading ? 'animate-spin' : ''} size={16} />
            Refresh
          </button>
        </div>

        {message && (
          <div className={`mb-4 p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            {message.text}
          </div>
        )}

        <div className="space-y-3">
          {notices.length > 0 ? (
            notices.map(notice => (
              <div key={notice.path} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-800">{notice.title}</h3>
                    {notice.pinned && (
                      <Pin className="text-blue-500" size={16} />
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      {notice.date}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                      {notice.category}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => deleteNotice(notice)}
                  disabled={deleteLoading === notice.path}
                  className="flex items-center gap-2 px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                >
                  {deleteLoading === notice.path ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    <Trash2 size={16} />
                  )}
                  Delete
                </button>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              No notices found
            </div>
          )}
        </div>
      </div>

      {/* Folder Management */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Folder className="text-red-600" size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Folder Management</h2>
          </div>
          <button
            onClick={loadFolders}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <RefreshCw className={isLoading ? 'animate-spin' : ''} size={16} />
            Refresh
          </button>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-2">
            <AlertTriangle className="text-yellow-600 flex-shrink-0 mt-0.5" size={16} />
            <div className="text-sm text-yellow-700">
              <strong>Warning:</strong> You can only delete subfolders within Achievements, Uploads, and Gallery. 
              The main folders themselves cannot be deleted for safety.
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="animate-spin text-gray-400" size={32} />
          </div>
        ) : (
          <div className="space-y-6">
            {MAIN_FOLDERS.map(mainFolder => (
              <div key={mainFolder} className="border rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <Folder size={18} />
                    {mainFolder}
                  </h3>
                </div>
                
                <div className="divide-y">
                  {folders[mainFolder]?.length > 0 ? (
                    folders[mainFolder].map(folder => (
                      <div key={folder.path} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50">
                        <span className="text-gray-700">{folder.name}</span>
                        <button
                          onClick={() => deleteFolder(mainFolder, folder.name, folder.path)}
                          disabled={deleteLoading === folder.path}
                          className="flex items-center gap-2 px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {deleteLoading === folder.path ? (
                            <Loader2 className="animate-spin" size={16} />
                          ) : (
                            <Trash2 size={16} />
                          )}
                          Delete
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-8 text-center text-gray-500">
                      No subfolders found in {mainFolder}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}