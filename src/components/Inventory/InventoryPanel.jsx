import { Package, Check, Shield, User } from 'lucide-react';
import { ProgressBar } from '../UI/ProgressBar';

export function InventoryPanel({ 
  items, 
  stats, 
  onToggleItem, 
  isItemChecked, 
  itemRequiredUpgrades,
  factionLevels,
  onFactionLevelChange
}) {
  const factions = [
    { id: 'igc', name: 'IGC' },
    { id: 'vlf', name: 'VLF' },
    { id: 'uics', name: 'UICS' },
    { id: 'player', name: 'Player' }
  ];

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

      <div className="card-tactical p-4">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="w-5 h-5 text-status-accent" />
          <h3 className="text-tactical-text font-bold">Faction & Player Levels</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {factions.map(faction => (
            <div key={faction.id} className="flex items-center gap-2">
              <label className="text-sm text-tactical-muted w-16">
                {faction.name}:
              </label>
              <input
                type="number"
                min="0"
                value={factionLevels?.[faction.id] || 0}
                onChange={(e) => onFactionLevelChange(faction.id, e.target.value)}
                className="input-dark w-20 text-center"
              />
            </div>
          ))}
        </div>
        <p className="text-xs text-tactical-muted mt-3">
          Set your faction and player levels to unlock upgrades that require them.
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