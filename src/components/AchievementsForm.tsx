import React, { useState } from 'react';
import { Trophy, Calendar, Image, FileText, Loader2 } from 'lucide-react';
import { Achievement } from '../types';
import { githubService } from '../services/githubService';

export default function AchievementsForm() {
  const [formData, setFormData] = useState<Achievement>({
    folderName: '',
    title: '',
    category: 'Achievements',
    date: new Date().toISOString().split('T')[0],
    description: '',
    image: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData({ ...formData, image: file });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      // Create data.txt content
      const dataContent = [
        formData.title,
        formData.category,
        formData.date,
        formData.description
      ].join('\n');

      // Create folder and data.txt
      await githubService.createFile(
        `Achievements/${formData.folderName}/data.txt`,
        dataContent,
        `Add achievement: ${formData.title}`
      );

      // Upload image if provided
      if (formData.image) {
        await githubService.uploadBinaryFile(
          `Achievements/${formData.folderName}/image.jpg`,
          formData.image,
          `Add image for achievement: ${formData.title}`
        );
      }

      setMessage({ type: 'success', text: 'Achievement created successfully!' });
      
      // Reset form
      setFormData({
        folderName: '',
        title: '',
        category: 'Achievements',
        date: new Date().toISOString().split('T')[0],
        description: '',
        image: null,
      });

      // Reset file input
      const fileInput = document.getElementById('achievement-image') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to create achievement' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-yellow-100 rounded-lg">
          <Trophy className="text-yellow-600" size={24} />
        </div>
        <h2 className="text-xl font-bold text-gray-800">Add Achievement</h2>
      </div>

      {message && (
        <div className={`mb-4 p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Folder Name *
          </label>
          <input
            type="text"
            value={formData.folderName}
            onChange={(e) => setFormData({ ...formData, folderName: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            placeholder="achievement-folder-name"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            placeholder="Achievement title"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category *
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value as 'Achievements' | 'Activity' })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          >
            <option value="Achievements">Achievements</option>
            <option value="Activity">Activity</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar size={16} className="inline mr-1" />
            Date *
          </label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FileText size={16} className="inline mr-1" />
            Description *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
            placeholder="Describe the achievement..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Image size={16} className="inline mr-1" />
            Image
          </label>
          <input
            id="achievement-image"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-yellow-50 file:text-yellow-700 hover:file:bg-yellow-100"
          />
          {formData.image && (
            <p className="mt-2 text-sm text-gray-600">
              Selected: {formData.image.name}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-3 px-6 rounded-lg font-medium hover:from-yellow-600 hover:to-orange-600 focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Creating Achievement...
            </>
          ) : (
            'Create Achievement'
          )}
        </button>
      </form>
    </div>
  );
}