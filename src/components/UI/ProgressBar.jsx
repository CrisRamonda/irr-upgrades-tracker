export function ProgressBar({ current, total, percentage, showLabel = true }) {
  const getColor = () => {
    if (percentage === 100) return 'bg-status-ready';
    if (percentage > 0) return 'bg-status-available';
    return 'bg-tactical-border';
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-tactical-border rounded-full overflow-hidden">
        <div
          className={`h-full ${getColor()} transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs text-tactical-muted font-mono min-w-[60px] text-right">
          {current}/{total}
        </span>
      )}
    </div>
  );
}