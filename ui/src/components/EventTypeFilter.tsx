import { cn } from '@/lib/utils';

export const EVENT_TYPES = ['Event', 'Committee Meeting', 'Conference', 'YPAA Meeting', 'Other'] as const;

interface EventTypeFilterProps {
  selectedTypes: string[];
  onTypesChange: (types: string[]) => void;
}

export default function EventTypeFilter({ selectedTypes, onTypesChange }: EventTypeFilterProps) {
  const handleTypeToggle = (type: string) => {
    if (selectedTypes.includes(type)) {
      onTypesChange(selectedTypes.filter(t => t !== type));
    } else {
      onTypesChange([...selectedTypes, type]);
    }
  };

  return (
    <div className="flex flex-col gap-3 p-4 bg-white dark:bg-gray-900 border-b">
      {/* Pill-style filter buttons */}
      <div className="flex flex-wrap gap-2">
        {EVENT_TYPES.map(type => {
          const isActive = selectedTypes.includes(type);
          return (
            <button
              key={type}
              onClick={() => handleTypeToggle(type)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200",
                "min-w-0 flex-shrink-0",
                "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                "hover:scale-105 active:scale-95",
                isActive
                  ? "bg-blue-500 text-white shadow-lg transform scale-105"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              )}
            >
              {type}
            </button>
          );
        })}
      </div>
    </div>
  );
}
