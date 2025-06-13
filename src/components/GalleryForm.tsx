import React, { useState } from 'react';
import { Camera, Images, Loader2 } from 'lucide-react';
import { Gallery } from '../types';
import { githubService } from '../services/githubService';

export default function GalleryForm() {
  const [formData, setFormData] = useState<Gallery>({
    folderName: '',
    images: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    setFormData({ ...formData, images: imageFiles });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      // Upload all images to the gallery folder
      for (const image of formData.images) {
        await githubService.uploadBinaryFile(
          `Gallery/${formData.folderName}/${image.name}`,
          image,
          `Add image: ${image.name} to gallery ${formData.folderName}`
        );
      }

      setMessage({ type: 'success', text: 'Gallery created successfully!' });
      
      // Reset form
      setFormData({
        folderName: '',
        images: [],
      });

      // Reset file input
      const fileInput = document.getElementById('gallery-images') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to create gallery' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-purple-100 rounded-lg">
          <Camera className="text-purple-600" size={24} />
        </div>
        <h2 className="text-xl font-bold text-gray-800">Create Gallery</h2>
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
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="gallery-folder-name"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Images size={16} className="inline mr-1" />
            Images *
          </label>
          <input
            id="gallery-images"
            type="file"
            multiple
            accept="image/*"
            onChange={handleImagesChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
            required
          />
          {formData.images.length > 0 && (
            <div className="mt-2">
              <p className="text-sm text-gray-600 mb-2">
                Selected images ({formData.images.length}):
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                {formData.images.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(image)}
                      alt={image.name}
                      className="w-full h-20 object-cover rounded-lg"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded-b-lg truncate">
                      {image.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-6 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Creating Gallery...
            </>
          ) : (
            'Create Gallery'
          )}
        </button>
      </form>
    </div>
  );
}