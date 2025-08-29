import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

const EVENT_TYPES = ['Event', 'Committee Meeting', 'Conference', 'YPAA Meeting', 'Other'] as const;

interface EventTypeFilterProps {
  selectedTypes: string[];
  onTypesChange: (types: string[]) => void;
}

export default function EventTypeFilter({ selectedTypes, onTypesChange }: EventTypeFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleTypeToggle = (type: string) => {
    if (selectedTypes.includes(type)) {
      onTypesChange(selectedTypes.filter(t => t !== type));
    } else {
      onTypesChange([...selectedTypes, type]);
    }
  };

  const handleTypeRemove = (typeToRemove: string) => {
    onTypesChange(selectedTypes.filter(t => t !== typeToRemove));
  };

  const handleClearAll = () => {
    onTypesChange([]);
  };

  return (
    <div className="flex flex-col gap-2 p-4 bg-white dark:bg-gray-900 border-b">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by Event Type</h3>
        {selectedTypes.length > 0 && (
          <button
            onClick={handleClearAll}
            className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Selected types badges */}
      {selectedTypes.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedTypes.map(type => (
            <Badge
              key={type}
              variant="secondary"
              className="flex items-center gap-1 text-xs"
            >
              {type}
              <button
                onClick={() => handleTypeRemove(type)}
                className="ml-1 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-full p-0.5"
                aria-label={`Remove ${type} filter`}
                title={`Remove ${type} filter`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Type selector */}
      <Select open={isOpen} onOpenChange={setIsOpen}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Add event type filter..." />
        </SelectTrigger>
        <SelectContent>
          {EVENT_TYPES
            .filter(type => !selectedTypes.includes(type))
            .map(type => (
              <SelectItem
                key={type}
                value={type}
                onClick={() => handleTypeToggle(type)}
              >
                {type}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>

      {selectedTypes.length === 0 && (
        <p className="text-xs text-gray-500">Showing all event types</p>
      )}
    </div>
  );
}
