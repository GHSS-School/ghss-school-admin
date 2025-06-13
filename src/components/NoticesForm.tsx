import React, { useState } from 'react';
import { Bell, Calendar, Pin, FileText, Loader2, RefreshCw } from 'lucide-react';
import { Notice } from '../types';
import { githubService } from '../services/githubService';

const categories = [
  'General', 'Urgent', 'Meeting', 'Event', 'Announcement', 
  'Holiday', 'Training', 'Other'
] as const;

export default function NoticesForm() {
  const [formData, setFormData] = useState<Notice>({
    noticeId: githubService.generateNoticeId(),
    title: '',
    date: new Date().toISOString().split('T')[0],
    pinned: false,
    category: 'General',
    content: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const generateNewId = () => {
    setFormData({ ...formData, noticeId: githubService.generateNoticeId() });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      // Create notice content
      const noticeContent = [
        formData.title,
        formData.date,
        formData.category,
        formData.pinned.toString(),
        formData.content
      ].join('\n');

      // Create notice file
      await githubService.createFile(
        `Notices/${formData.noticeId}.txt`,
        noticeContent,
        `Add notice: ${formData.title}`
      );

      setMessage({ type: 'success', text: 'Notice created successfully!' });
      
      // Reset form with new ID
      setFormData({
        noticeId: githubService.generateNoticeId(),
        title: '',
        date: new Date().toISOString().split('T')[0],
        pinned: false,
        category: 'General',
        content: '',
      });

    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to create notice' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Bell className="text-blue-600" size={24} />
        </div>
        <h2 className="text-xl font-bold text-gray-800">Create Notice</h2>
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
            Notice ID
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={formData.noticeId}
              onChange={(e) => setFormData({ ...formData, noticeId: e.target.value })}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <button
              type="button"
              onClick={generateNewId}
              className="px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Generate new ID"
            >
              <RefreshCw size={18} />
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Notice title"
            required
          />
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
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="pinned"
            checked={formData.pinned}
            onChange={(e) => setFormData({ ...formData, pinned: e.target.checked })}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
          <label htmlFor="pinned" className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Pin size={16} />
            Pin this notice
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category *
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value as Notice['category'] })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FileText size={16} className="inline mr-1" />
            Content *
          </label>
          <textarea
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            rows={6}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="Enter notice content..."
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Creating Notice...
            </>
          ) : (
            'Create Notice'
          )}
        </button>
      </form>
    </div>
  );
}