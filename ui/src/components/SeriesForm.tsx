import { useState, useEffect } from 'react';
import { z } from 'zod';
import { RRule } from 'rrule';

// Types for series configuration
export interface SeriesConfig {
  freq: 'weekly' | 'monthly';
  interval: number;
  byWeekday?: string[];
  bySetPos?: number[];
  until?: string;
  count?: number;
}

interface SeriesFormProps {
  initialConfig?: SeriesConfig;
  onConfigChange: (config: SeriesConfig) => void;
  showPreview?: boolean;
  startTime?: string; // HH:mm format
  timezone?: string;
}

const seriesSchema = z.object({
  freq: z.enum(['weekly', 'monthly']),
  interval: z.number().min(1).max(52),
  byWeekday: z.array(z.string()).optional(),
  bySetPos: z.array(z.number()).optional(),
  until: z.string().optional(),
  count: z.number().min(1).optional(),
});

export default function SeriesForm({
  initialConfig,
  onConfigChange,
  showPreview = true,
  startTime = '09:00',
  timezone = 'UTC'
}: SeriesFormProps) {
  const [config, setConfig] = useState<SeriesConfig>(initialConfig || {
    freq: 'weekly',
    interval: 1,
    byWeekday: ['MO'],
  });

  const [previewDates, setPreviewDates] = useState<Date[]>([]);

  // Weekday options
  const weekdays = [
    { value: 'MO', label: 'Monday' },
    { value: 'TU', label: 'Tuesday' },
    { value: 'WE', label: 'Wednesday' },
    { value: 'TH', label: 'Thursday' },
    { value: 'FR', label: 'Friday' },
    { value: 'SA', label: 'Saturday' },
    { value: 'SU', label: 'Sunday' },
  ];

  // Position options for monthly
  const positions = [
    { value: 1, label: '1st' },
    { value: 2, label: '2nd' },
    { value: 3, label: '3rd' },
    { value: 4, label: '4th' },
    { value: -1, label: 'Last' },
  ];

  // Generate preview dates when config changes
  useEffect(() => {
    if (!showPreview) return;

    try {
      const rruleOptions: any = {
        freq: config.freq === 'weekly' ? RRule.WEEKLY : RRule.MONTHLY,
        interval: config.interval,
        dtstart: new Date(),
      };

      if (config.byWeekday && config.byWeekday.length > 0) {
        rruleOptions.byweekday = config.byWeekday.map(day => {
          const dayMap: { [key: string]: number } = {
            'MO': RRule.MO,
            'TU': RRule.TU,
            'WE': RRule.WE,
            'TH': RRule.TH,
            'FR': RRule.FR,
            'SA': RRule.SA,
            'SU': RRule.SU,
          };
          return dayMap[day];
        });
      }

      if (config.freq === 'monthly' && config.bySetPos && config.bySetPos.length > 0) {
        rruleOptions.bysetpos = config.bySetPos;
      }

      if (config.until) {
        rruleOptions.until = new Date(config.until);
      }

      if (config.count) {
        rruleOptions.count = config.count;
      } else {
        rruleOptions.count = 5; // Default to 5 occurrences for preview
      }

      const rrule = new RRule(rruleOptions);
      const dates = rrule.all();
      setPreviewDates(dates);

    } catch (error) {
      console.error('Error generating preview:', error);
      setPreviewDates([]);
    }
  }, [config, showPreview]);

  // Update config and notify parent
  const updateConfig = (updates: Partial<SeriesConfig>) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
    onConfigChange(newConfig);
  };

  // Handle frequency change
  const handleFreqChange = (freq: 'weekly' | 'monthly') => {
    let newConfig: SeriesConfig = {
      ...config,
      freq,
      interval: 1,
    };

    if (freq === 'weekly') {
      newConfig.byWeekday = ['MO'];
      newConfig.bySetPos = undefined;
    } else if (freq === 'monthly') {
      newConfig.byWeekday = ['MO'];
      newConfig.bySetPos = [1];
    }

    setConfig(newConfig);
    onConfigChange(newConfig);
  };

  // Handle weekday selection for weekly
  const handleWeekdayToggle = (weekday: string) => {
    if (config.freq !== 'weekly') return;

    const currentWeekdays = config.byWeekday || [];
    let newWeekdays: string[];

    if (currentWeekdays.includes(weekday)) {
      newWeekdays = currentWeekdays.filter(w => w !== weekday);
      if (newWeekdays.length === 0) {
        newWeekdays = ['MO']; // Default to Monday if all deselected
      }
    } else {
      newWeekdays = [...currentWeekdays, weekday];
    }

    updateConfig({ byWeekday: newWeekdays });
  };

  // Handle position selection for monthly
  const handlePositionChange = (position: number) => {
    if (config.freq !== 'monthly') return;
    updateConfig({ bySetPos: [position] });
  };

  // Handle weekday selection for monthly
  const handleMonthlyWeekdayChange = (weekday: string) => {
    if (config.freq !== 'monthly') return;
    updateConfig({ byWeekday: [weekday] });
  };

  // Generate human-readable description
  const getDescription = () => {
    if (config.freq === 'weekly') {
      const dayNames = (config.byWeekday || []).map(day => {
        const dayObj = weekdays.find(w => w.value === day);
        return dayObj?.label || day;
      });

      if (config.interval === 1) {
        return `Every week on ${dayNames.join(', ')}`;
      } else {
        return `Every ${config.interval} weeks on ${dayNames.join(', ')}`;
      }
    } else if (config.freq === 'monthly') {
      const positionObj = positions.find(p => p.value === config.bySetPos?.[0]);
      const dayObj = weekdays.find(w => w.value === config.byWeekday?.[0]);

      const position = positionObj?.label || '1st';
      const day = dayObj?.label || 'Monday';

      if (config.interval === 1) {
        return `Monthly on the ${position} ${day}`;
      } else {
        return `Every ${config.interval} months on the ${position} ${day}`;
      }
    }
    return 'Custom recurrence';
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Recurrence Pattern
        </h3>

        {/* Frequency Selection */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Frequency
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="freq"
                  value="weekly"
                  checked={config.freq === 'weekly'}
                  onChange={(e) => handleFreqChange(e.target.value as 'weekly')}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Weekly</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="freq"
                  value="monthly"
                  checked={config.freq === 'monthly'}
                  onChange={(e) => handleFreqChange(e.target.value as 'monthly')}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Monthly</span>
              </label>
            </div>
          </div>

          {/* Interval */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Every
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min="1"
                max={config.freq === 'weekly' ? '52' : '12'}
                value={config.interval}
                onChange={(e) => updateConfig({ interval: parseInt(e.target.value) || 1 })}
                className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                aria-label="Interval"
                title="Number of weeks/months between occurrences"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {config.freq === 'weekly' ? 'week(s)' : 'month(s)'}
              </span>
            </div>
          </div>

          {/* Weekly Options */}
          {config.freq === 'weekly' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                On these days
              </label>
              <div className="flex flex-wrap gap-2">
                {weekdays.map(day => (
                  <label key={day.value} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={config.byWeekday?.includes(day.value) || false}
                      onChange={() => handleWeekdayToggle(day.value)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{day.label.slice(0, 3)}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Monthly Options */}
          {config.freq === 'monthly' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Position
                </label>
                <select
                  value={config.bySetPos?.[0] || 1}
                  onChange={(e) => handlePositionChange(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                  aria-label="Position"
                  title="Select which occurrence of the day in the month"
                >
                  {positions.map(pos => (
                    <option key={pos.value} value={pos.value}>
                      {pos.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Day of Week
                </label>
                <select
                  value={config.byWeekday?.[0] || 'MO'}
                  onChange={(e) => handleMonthlyWeekdayChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                  aria-label="Day of week"
                  title="Select the day of the week"
                >
                  {weekdays.map(day => (
                    <option key={day.value} value={day.value}>
                      {day.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* End Condition */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                End Date (optional)
              </label>
              <input
                type="date"
                value={config.until || ''}
                onChange={(e) => updateConfig({ until: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                aria-label="End date"
                title="End date for the recurring series"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Or After (occurrences)
              </label>
              <input
                type="number"
                min="1"
                value={config.count || ''}
                onChange={(e) => updateConfig({ count: parseInt(e.target.value) || undefined })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                placeholder="Leave empty for no limit"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Pattern Description */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
          Pattern Summary
        </h4>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          {getDescription()}
        </p>
      </div>

      {/* Preview */}
      {showPreview && previewDates.length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            Next Occurrences
          </h4>
          <div className="space-y-1">
            {previewDates.slice(0, 5).map((date, index) => (
              <div key={index} className="text-sm text-gray-700 dark:text-gray-300">
                {date.toLocaleDateString()} at {startTime} ({timezone})
              </div>
            ))}
            {previewDates.length > 5 && (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                ... and {previewDates.length - 5} more occurrences
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
