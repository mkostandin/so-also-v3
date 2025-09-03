import React from 'react';

interface EventContactProps {
  websiteUrl?: string | null;
  contactEmail?: string | null;
  onContactCommittee: () => void;
}

export default function EventContact({
  websiteUrl,
  contactEmail,
  onContactCommittee
}: EventContactProps) {
  if (!websiteUrl && !contactEmail) {
    return null;
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-center">Contact Information</h3>
      <div className="flex flex-col items-center gap-3">
        {websiteUrl && (
          <a
            href={websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
          >
            Visit Committee Website
          </a>
        )}
        {contactEmail && (
          <button
            onClick={onContactCommittee}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Contact Committee
          </button>
        )}
      </div>
    </div>
  );
}
