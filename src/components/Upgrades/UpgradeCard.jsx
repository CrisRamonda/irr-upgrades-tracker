import { Check, X, Lock, ChevronRight } from 'lucide-react';
import { Badge } from '../UI/Badge';
import { ProgressBar } from '../UI/ProgressBar';

export function UpgradeCard({
  upgrade,
  status,
  progress,
  prerequisites,
  factions,
  items,
  onToggleItem
}) {
  const statusColors = {
    locked: {
      border: 'border-status-locked/50',
      bg: 'bg-status-locked/5',
      badge: 'locked'
    },
    available: {
      border: 'border-status-available/50',
      bg: 'bg-status-available/5',
      badge: 'available'
    },
    ready: {
      border: 'border-status-ready/50',
      bg: 'bg-status-ready/5',
      badge: 'ready'
    }
  };

  const style = statusColors[status];

  return (
    <div className={`card-tactical p-4 ${style.border} ${style.bg}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-tactical-text font-bold">{upgrade.name}</h3>
          <Badge variant={style.badge} className="mt-1">
            {status === 'locked' && <Lock className="w-3 h-3 mr-1" />}
            {status === 'ready' && <Check className="w-3 h-3 mr-1" />}
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        </div>
      </div>

      {progress.total > 0 && (
        <div className="mb-3">
          <ProgressBar {...progress} />
        </div>
      )}

      {prerequisites.length > 0 && (
        <div className="mb-3">
          <p className="text-xs text-tactical-muted mb-1">Requires:</p>
          <div className="flex flex-wrap gap-1">
            {prerequisites.map(prereq => (
              <Badge key={prereq.id} variant={prereq.isCompleted ? 'ready' : 'default'}>
                {prereq.isCompleted && <Check className="w-3 h-3 mr-1" />}
                {!prereq.isCompleted && <ChevronRight className="w-3 h-3 mr-1" />}
                {prereq.name}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {factions.length > 0 && (
        <div className="mb-3">
          <p className="text-xs text-tactical-muted mb-1">Faction Required:</p>
          <div className="flex flex-wrap gap-1">
            {factions.map(f => (
              <Badge key={f.name} variant="faction">
                {f.name} Lv.{f.level}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-1">
        <p className="text-xs text-tactical-muted mb-2">
          Items ({items.filter(i => i.hasItem).length}/{items.length}):
        </p>
        {items.map(item => (
          <label
            key={item.itemId}
            className="flex items-center gap-2 py-1 px-2 rounded hover:bg-tactical-elevated 
                       cursor-pointer transition-colors"
          >
            <input
              type="checkbox"
              checked={item.hasItem}
              onChange={() => onToggleItem(upgrade.id, item.itemId)}
              className="checkbox-custom"
              disabled={status === 'locked'}
            />
            <span className={`text-sm ${item.hasItem ? 'text-status-ready' : 'text-tactical-text'}`}>
              {item.name}
            </span>
            <span className="text-xs text-tactical-muted ml-auto font-mono">
              x{item.quantity}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}