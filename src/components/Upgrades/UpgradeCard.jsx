import { Check, X, Lock, ChevronRight, Hammer, Undo2 } from 'lucide-react';
import { Badge } from '../UI/Badge';
import { ProgressBar } from '../UI/ProgressBar';
import { formatNumber } from '../../utils/format';

export function UpgradeCard({
  upgrade,
  status,
  progress,
  prerequisites,
  factions,
  items,
  built,
  onToggleItem,
  onToggleBuilt
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
    },
    built: {
      border: 'border-status-accent/50',
      bg: 'bg-status-accent/5',
      badge: 'built'
    }
  };

  const currentStatus = built ? 'built' : status;
  const style = statusColors[currentStatus];
  const isItemsDisabled = currentStatus === 'locked' || currentStatus === 'built';
  const showBuildButton = currentStatus === 'ready' || currentStatus === 'built';

  return (
    <div className={`card-tactical p-4 ${style.border} ${style.bg}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-tactical-text font-bold">{upgrade.name}</h3>
          <Badge variant={style.badge} className="mt-1">
            {currentStatus === 'locked' && <Lock className="w-3 h-3 mr-1" />}
            {currentStatus === 'ready' && <Check className="w-3 h-3 mr-1" />}
            {currentStatus === 'built' && <Hammer className="w-3 h-3 mr-1" />}
            {currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}
          </Badge>
        </div>
        {showBuildButton && (
          <button
            onClick={() => onToggleBuilt(upgrade.id)}
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-all
                       ${currentStatus === 'ready' 
                         ? 'bg-status-ready/20 text-status-ready hover:bg-status-ready/30' 
                         : 'bg-status-accent/20 text-status-accent hover:bg-status-accent/30'}`}
          >
            {currentStatus === 'ready' ? (
              <>
                <Hammer className="w-3 h-3" />
                Build
              </>
            ) : (
              <>
                <Undo2 className="w-3 h-3" />
                Unbuild
              </>
            )}
          </button>
        )}
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
            className={`flex items-center gap-2 py-1 px-2 rounded transition-colors
                       ${isItemsDisabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:bg-tactical-elevated'}`}
          >
            <input
              type="checkbox"
              checked={item.hasItem}
              onChange={() => onToggleItem(upgrade.id, item.itemId)}
              className="checkbox-custom"
              disabled={isItemsDisabled}
            />
            <span className={`text-sm ${item.hasItem ? 'text-status-ready' : 'text-tactical-text'}`}>
              {item.name}
            </span>
            <span className="text-xs text-tactical-muted ml-auto font-mono">
              x{formatNumber(item.quantity)}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}