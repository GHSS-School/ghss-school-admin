import React, { useState, useEffect } from 'react';
import { Trophy, Bell, Upload, Settings, GraduationCap, Camera } from 'lucide-react';
import { GitHubConfig } from './types';
import { githubService } from './services/githubService';
import GitHubConfigComponent from './components/GitHubConfig';
import AchievementsForm from './components/AchievementsForm';
import NoticesForm from './components/NoticesForm';
import UploadsForm from './components/UploadsForm';
import GalleryForm from './components/GalleryForm';
import FolderManager from './components/FolderManager';

type Tab = 'achievements' | 'notices' | 'uploads' | 'gallery' | 'manage';

const tabs = [
  { id: 'achievements' as Tab, label: 'Achievements', icon: Trophy, color: 'yellow' },
  { id: 'notices' as Tab, label: 'Notices', icon: Bell, color: 'blue' },
  { id: 'uploads' as Tab, label: 'Uploads', icon: Upload, color: 'green' },
  { id: 'gallery' as Tab, label: 'Gallery', icon: Camera, color: 'purple' },
  { id: 'manage' as Tab, label: 'Manage', icon: Settings, color: 'red' },
];

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('achievements');
  const [githubConfig, setGitHubConfig] = useState<GitHubConfig | null>(null);

  useEffect(() => {
    // Load config from localStorage
    const savedConfig = localStorage.getItem('githubConfig');
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);
        setGitHubConfig(config);
        githubService.setConfig(config);
      } catch (error) {
        console.error('Failed to load GitHub config:', error);
      }
    }
  }, []);

  const handleConfigSave = (config: GitHubConfig) => {
    setGitHubConfig(config);
    githubService.setConfig(config);
    localStorage.setItem('githubConfig', JSON.stringify(config));
  };

  const renderContent = () => {
    if (!githubConfig) {
      return (
        <GitHubConfigComponent 
          config={githubConfig} 
          onConfigSave={handleConfigSave} 
        />
      );
    }

    switch (activeTab) {
      case 'achievements':
        return <AchievementsForm />;
      case 'notices':
        return <NoticesForm />;
      case 'uploads':
        return <UploadsForm />;
      case 'gallery':
        return <GalleryForm />;
      case 'manage':
        return <FolderManager />;
      default:
        return <AchievementsForm />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                <GraduationCap className="text-white" size={28} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">GHSS School Manager</h1>
                <p className="text-sm text-gray-600">Manage achievements, notices, uploads & gallery</p>
              </div>
            </div>
            
            {githubConfig && (
              <GitHubConfigComponent 
                config={githubConfig} 
                onConfigSave={handleConfigSave} 
              />
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {githubConfig && (
          <div className="mb-6">
            {/* Tab Navigation */}
            <div className="bg-white rounded-xl shadow-sm p-2 mb-6">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {tabs.map(tab => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                        isActive
                          ? `bg-${tab.color}-100 text-${tab.color}-700 shadow-sm`
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                      }`}
                    >
                      <Icon size={18} />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        {renderContent()}
      </div>

      {/* Footer */}
      <div className="bg-white border-t mt-12">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center text-gray-600">
            <p className="text-sm">
              GHSS School Management System - Built with React & GitHub API
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;