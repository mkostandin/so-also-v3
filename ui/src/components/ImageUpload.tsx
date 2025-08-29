import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { api } from '@/lib/api-client';
import { X, Upload, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  onImagesChange: (urls: string[]) => void;
  maxImages?: number;
  existingImages?: string[];
}

export default function ImageUpload({ onImagesChange, maxImages = 10, existingImages = [] }: ImageUploadProps) {
  const [images, setImages] = useState<string[]>(existingImages);
  const [uploading, setUploading] = useState<Set<string>>(new Set());
  const [errors, setErrors] = useState<string[]>([]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const newErrors: string[] = [];

    // Validate file count
    if (images.length + acceptedFiles.length > maxImages) {
      newErrors.push(`Maximum ${maxImages} images allowed`);
      setErrors(newErrors);
      return;
    }

    // Validate each file
    for (const file of acceptedFiles) {
      if (!file.type.startsWith('image/')) {
        newErrors.push(`${file.name} is not an image file`);
        continue;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB
        newErrors.push(`${file.name} is too large (max 5MB)`);
        continue;
      }
    }

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors([]);

    // Upload files
    const uploadPromises = acceptedFiles.map(async (file) => {
      const tempId = `${file.name}-${Date.now()}`;
      setUploading(prev => new Set(prev).add(tempId));

      try {
        const result = await api.uploadImage(file);
        return result.url;
      } catch (error) {
        newErrors.push(`Failed to upload ${file.name}`);
        return null;
      } finally {
        setUploading(prev => {
          const newSet = new Set(prev);
          newSet.delete(tempId);
          return newSet;
        });
      }
    });

    const results = await Promise.all(uploadPromises);
    const successfulUploads = results.filter(url => url !== null) as string[];

    const updatedImages = [...images, ...successfulUploads];
    setImages(updatedImages);
    onImagesChange(updatedImages);

    if (newErrors.length > 0) {
      setErrors(newErrors);
    }
  }, [images, maxImages, onImagesChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    multiple: true,
    maxFiles: maxImages - images.length
  });

  const removeImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index);
    setImages(updatedImages);
    onImagesChange(updatedImages);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Event Images
        </label>

        {/* Upload Area */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {isDragActive
              ? 'Drop images here...'
              : `Drag & drop images here, or click to select (${images.length}/${maxImages})`
            }
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            Supports JPEG, PNG, WebP (max 5MB each)
          </p>
        </div>
      </div>

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="space-y-1">
          {errors.map((error, index) => (
            <p key={index} className="text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          ))}
        </div>
      )}

      {/* Image Previews */}
      {images.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Uploaded Images ({images.length})
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {images.map((url, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                  <img
                    src={url}
                    alt={`Event image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove image"
                  aria-label={`Remove image ${index + 1}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {uploading.size > 0 && (
        <div className="flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
          <span>Uploading {uploading.size} image{uploading.size > 1 ? 's' : ''}...</span>
        </div>
      )}
    </div>
  );
}
