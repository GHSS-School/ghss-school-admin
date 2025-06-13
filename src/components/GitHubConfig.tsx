import React, { useState } from 'react';
import { Settings, Save, Eye, EyeOff } from 'lucide-react';
import { GitHubConfig } from '../types';

interface Props {
  config: GitHubConfig | null;
  onConfigSave: (config: GitHubConfig) => void;
}

export default function GitHubConfigComponent({ config, onConfigSave }: Props) {
  const [isOpen, setIsOpen] = useState(!config);
  const [formData, setFormData] = useState<GitHubConfig>({
    token: config?.token || '',
    owner: config?.owner || 'GHSS-School',
    repo: config?.repo || 'GHSS_School',
  });
  const [showToken, setShowToken] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.token && formData.owner && formData.repo) {
      onConfigSave(formData);
      setIsOpen(false);
    }
  };

  if (!isOpen && config) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
      >
        <Settings size={16} />
        Configure GitHub
      </button>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Settings className="text-blue-500" size={20} />
        <h2 className="text-lg font-semibold text-gray-800">GitHub Configuration</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Personal Access Token *
          </label>
          <div className="relative">
            <input
              type={showToken ? 'text' : 'password'}
              value={formData.token}
              onChange={(e) => setFormData({ ...formData, token: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
              required
            />
            <button
              type="button"
              onClick={() => setShowToken(!showToken)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showToken ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Repository Owner *
          </label>
          <input
            type="text"
            value={formData.owner}
            onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="GHSS-School"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Repository Name *
          </label>
          <input
            type="text"
            value={formData.repo}
            onChange={(e) => setFormData({ ...formData, repo: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="GHSS_School"
            required
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Save size={16} />
            Save Configuration
          </button>
          
          {config && (
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-700">
          <strong>Note:</strong> Your GitHub token needs the following permissions: 
          <code className="bg-white px-1 py-0.5 rounded text-xs ml-1">repo</code> (Full control of private repositories)
        </p>
      </div>
    </div>
  );
}