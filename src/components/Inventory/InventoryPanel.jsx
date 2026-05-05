import { Package, Check } from 'lucide-react';
import { ProgressBar } from '../UI/ProgressBar';

export function InventoryPanel({ items, stats, onToggleItem, isItemChecked, itemRequiredUpgrades }) {
  return (
    <div className="p-4 space-y-4">
      <div className="card-tactical p-4">
        <div className="flex items-center gap-3 mb-3">
          <Package className="w-5 h-5 text-status-accent" />
          <h2 className="text-tactical-text font-bold">Inventory</h2>
        </div>
        <ProgressBar
          current={stats.collected}
          total={items.length}
          percentage={stats.percentage}
        />
        <p className="text-xs text-tactical-muted mt-2">
          {stats.collected} of {items.length} unique items collected
        </p>
        <p className="text-xs text-tactical-muted mt-1">
          Total items needed: {stats.total}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {items.map(item => {
          const isChecked = isItemChecked ? isItemChecked(item.id) : false;
          const upgradeCount = itemRequiredUpgrades ? itemRequiredUpgrades[item.id]?.length || 0 : 0;

          return (
            <label
              key={item.id}
              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer
                         transition-all border
                         ${isChecked
                           ? 'bg-status-ready/10 border-status-ready/30'
                           : 'bg-tactical-card border-tactical-border hover:bg-tactical-elevated'}`}
            >
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => onToggleItem(item.id)}
                className="checkbox-custom"
              />
              <div className="flex-1 min-w-0">
                <span className={`text-sm truncate block ${isChecked ? 'text-status-ready' : 'text-tactical-text'}`}>
                  {item.name}
                </span>
                <span className="text-xs text-tactical-muted">
                  x{item.totalRequired} total • {upgradeCount} upgrade{upgradeCount !== 1 ? 's' : ''}
                </span>
              </div>
              {isChecked && (
                <Check className="w-4 h-4 text-status-ready flex-shrink-0" />
              )}
            </label>
          );
        })}
      </div>

      {items.length === 0 && (
        <div className="text-center py-8 text-tactical-muted">
          No items to track. Import upgrade data first.
        </div>
      )}
    </div>
  );
}