import { X, Check, Hammer, Minus } from 'lucide-react';
import { Badge } from '../UI/Badge';

export function ItemUpgradesOverlay({ item, upgrades, onClose }) {
  const totalMarked = upgrades
    .filter(u => u.isChecked)
    .reduce((sum, u) => sum + u.quantity, 0);

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="card-tactical p-4 w-full max-w-lg mx-4 max-h-[80vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-tactical-text font-bold">{item.name}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-tactical-elevated transition-colors text-tactical-muted hover:text-tactical-text"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto space-y-2 flex-1 min-h-0">
          {upgrades.map(upg => (
            <div
              key={upg.upgradeId}
              className={`flex items-center gap-3 py-2 px-3 rounded ${
                upg.isBuilt ? 'bg-status-accent/5' : 'bg-tactical-elevated'
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-tactical-text truncate">
                    {upg.upgradeName}
                  </span>
                  {upg.isBuilt && (
                    <Badge variant="built">
                      <Hammer className="w-3 h-3 mr-1" />
                      Built
                    </Badge>
                  )}
                </div>
              </div>
              <span className="text-xs text-tactical-muted font-mono whitespace-nowrap">
                x{upg.quantity}
              </span>
              <span className="flex-shrink-0 w-5 flex justify-center">
                {upg.isChecked ? (
                  upg.isBuilt ? (
                    <Hammer className="w-4 h-4 text-status-accent" />
                  ) : (
                    <Check className="w-4 h-4 text-status-ready" />
                  )
                ) : (
                  <Minus className="w-4 h-4 text-tactical-muted" />
                )}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-3 pt-3 border-t border-tactical-border space-y-1">
          <p className="text-sm text-tactical-text">
            Submitted: <span className="text-status-ready font-bold">{totalMarked.toLocaleString()}</span>
            {' / '}
            <span className="text-tactical-muted">{item.totalRequired.toLocaleString()}</span>
          </p>
          <p className="text-xs text-tactical-muted">
            Remaining: <span className={totalMarked >= item.totalRequired ? 'text-status-ready' : 'text-status-locked'}>{(item.totalRequired - totalMarked).toLocaleString()}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
