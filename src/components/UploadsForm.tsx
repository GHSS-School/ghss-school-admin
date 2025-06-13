import React, { useState } from 'react';
import { Upload, Calendar, FileText, Loader2, Files } from 'lucide-react';
import { Upload as UploadType } from '../types';
import { githubService } from '../services/githubService';

export default function UploadsForm() {
  const [formData, setFormData] = useState<UploadType>({
    folderName: '',
    title: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    files: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData({ ...formData, files });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      // Create data.txt content
      const dataContent = [
        formData.title,
        formData.date,
        formData.description || ''
      ].join('\n');

      // Create folder and data.txt
      await githubService.createFile(
        `Uploads/${formData.folderName}/data.txt`,
        dataContent,
        `Add upload folder: ${formData.title}`
      );

      // Upload all files
      for (const file of formData.files) {
        await githubService.uploadBinaryFile(
          `Uploads/${formData.folderName}/${file.name}`,
          file,
          `Add file: ${file.name}`
        );
      }

      setMessage({ type: 'success', text: 'Upload completed successfully!' });
      
      // Reset form
      setFormData({
        folderName: '',
        title: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
        files: [],
      });

      // Reset file input
      const fileInput = document.getElementById('upload-files') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to upload files' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-green-100 rounded-lg">
          <Upload className="text-green-600" size={24} />
        </div>
        <h2 className="text-xl font-bold text-gray-800">Upload Files</h2>
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
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="upload-folder-name"
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
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Upload title"
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
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FileText size={16} className="inline mr-1" />
            Description (Optional)
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
            placeholder="Optional description..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Files size={16} className="inline mr-1" />
            Files *
          </label>
          <input
            id="upload-files"
            type="file"
            multiple
            onChange={handleFilesChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
            required
          />
          {formData.files.length > 0 && (
            <div className="mt-2">
              <p className="text-sm text-gray-600 mb-2">
                Selected files ({formData.files.length}):
              </p>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {formData.files.map((file, index) => (
                  <div key={index} className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
                    {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white py-3 px-6 rounded-lg font-medium hover:from-green-600 hover:to-teal-600 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Uploading Files...
            </>
          ) : (
            'Upload Files'
          )}
        </button>
      </form>
    </div>
  );
}