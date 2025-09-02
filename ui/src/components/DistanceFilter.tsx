import { useCallback } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export const DISTANCE_OPTIONS = [
  { value: 'all', label: 'All Events' },
  { value: '500', label: '500 miles' },
  { value: '150', label: '150 miles' },
  { value: '50', label: '50 miles' },
] as const;

interface DistanceFilterProps {
  selectedDistance: string;
  onDistanceChange: (distance: string) => void;
}

export default function DistanceFilter({ selectedDistance, onDistanceChange }: DistanceFilterProps) {
  const handleDistanceChange = useCallback((value: string) => {
    onDistanceChange(value);
  }, [onDistanceChange]);

  const selectedOption = DISTANCE_OPTIONS.find(option => option.value === selectedDistance);

  return (
    <div className="flex flex-col gap-3 p-4 bg-white dark:bg-gray-900">
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
          Distance:
        </label>
        <Select value={selectedDistance} onValueChange={handleDistanceChange}>
          <SelectTrigger className="w-40">
            <SelectValue>
              {selectedOption?.label || '150 miles'}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {DISTANCE_OPTIONS.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
