interface CalendarEventIndicatorProps {
  count: number;
  maxDisplay?: number;
  onClick?: () => void;
}

export default function CalendarEventIndicator({ count, maxDisplay = 99, onClick }: CalendarEventIndicatorProps) {
  if (count === 0) return null;

  const displayCount = count > maxDisplay ? `${maxDisplay}+` : count.toString();

  return (
    <button
      onClick={onClick}
      className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition-colors cursor-pointer"
      title={`${count} event${count !== 1 ? 's' : ''}`}
    >
      {displayCount}
    </button>
  );
}
