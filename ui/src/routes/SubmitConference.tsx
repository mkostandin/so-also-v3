import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api-client';
import ImageUpload from '@/components/ImageUpload';

// Form validation schema
const conferenceSchema = z.object({
  name: z.string().min(2, 'Conference name must be at least 2 characters'),
  city: z.string().min(1, 'City is required'),
  description: z.string().optional(),
  startsAtUtc: z.string().datetime('Invalid start date'),
  endsAtUtc: z.string().datetime('Invalid end date'),
  websiteUrl: z.string().url('Invalid website URL').optional().or(z.literal('')),
  programUrl: z.string().url('Invalid program URL').optional().or(z.literal('')),
  hotelMapUrl: z.string().url('Invalid hotel map URL').optional().or(z.literal('')),
  flyerUrl: z.string().url('Invalid flyer URL').optional().or(z.literal('')),
  imageUrls: z.array(z.string().url()).optional(),
});

type ConferenceFormData = z.infer<typeof conferenceSchema>;

export default function SubmitConference() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ConferenceFormData>({
    resolver: zodResolver(conferenceSchema),
    defaultValues: {
      imageUrls: [],
    },
  });

  const imageUrls = watch('imageUrls') || [];

  const onSubmit = async (data: ConferenceFormData) => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);

      // Submit conference (API client handles camelCase to snake_case transformation)
      const result = await api.createConference(data);

      // Navigate to the new conference
      navigate(`/app/conferences/${result.id}`);
    } catch (error) {
      console.error('Error submitting conference:', error);
      setSubmitError(error instanceof Error ? error.message : 'Failed to submit conference');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImagesChange = (urls: string[]) => {
    setValue('imageUrls', urls);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Submit Conference</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Submit a conference for approval. All conferences are reviewed before being published.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Basic Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Conference Name *
              </label>
              <input
                {...register('name')}
                type="text"
                id="name"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter conference name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                City *
              </label>
              <input
                {...register('city')}
                type="text"
                id="city"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter city"
              />
              {errors.city && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.city.message}</p>
              )}
            </div>
          </div>

          <div className="mt-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              {...register('description')}
              id="description"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Provide a detailed description of the conference"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description.message}</p>
            )}
          </div>
        </div>

        {/* Dates */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Conference Dates</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="startsAtUtc" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Start Date & Time *
              </label>
              <input
                {...register('startsAtUtc')}
                type="datetime-local"
                id="startsAtUtc"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.startsAtUtc && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.startsAtUtc.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="endsAtUtc" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                End Date & Time *
              </label>
              <input
                {...register('endsAtUtc')}
                type="datetime-local"
                id="endsAtUtc"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.endsAtUtc && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.endsAtUtc.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* URLs */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Links & Resources</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="websiteUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Website URL
              </label>
              <input
                {...register('websiteUrl')}
                type="url"
                id="websiteUrl"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://conference-website.com"
              />
              {errors.websiteUrl && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.websiteUrl.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="programUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Program URL
              </label>
              <input
                {...register('programUrl')}
                type="url"
                id="programUrl"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://program-schedule.com"
              />
              {errors.programUrl && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.programUrl.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="hotelMapUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Hotel Map URL
              </label>
              <input
                {...register('hotelMapUrl')}
                type="url"
                id="hotelMapUrl"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://hotel-map.com"
              />
              {errors.hotelMapUrl && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.hotelMapUrl.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="flyerUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Flyer URL
              </label>
              <input
                {...register('flyerUrl')}
                type="url"
                id="flyerUrl"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://flyer-image.com"
              />
              {errors.flyerUrl && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.flyerUrl.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Conference Images</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Upload images to showcase your conference. The first image will be used as the main conference image.
          </p>

          <ImageUpload
            images={imageUrls}
            onImagesChange={handleImagesChange}
            maxImages={5}
          />

          {errors.imageUrls && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.imageUrls.message}</p>
          )}
        </div>

        {/* Submit Error */}
        {submitError && (
          <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-800 dark:text-red-200">{submitError}</p>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Conference'}
          </button>
        </div>
      </form>
    </div>
  );
}
