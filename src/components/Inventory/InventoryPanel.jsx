import { useState, useEffect } from 'react';
import { Package, Check, Shield, User, Info } from 'lucide-react';
import { ProgressBar } from '../UI/ProgressBar';
import { ItemUpgradesOverlay } from './ItemUpgradesOverlay';

export function InventoryPanel({ 
  items, 
  stats, 
  onToggleItem, 
  isItemChecked, 
  itemRequiredUpgrades,
  factionLevels,
  onFactionLevelChange,
  getItemUpgradeDetails,
  isBuiltUpgrade
}) {
  const [overlayItem, setOverlayItem] = useState(null);
  const [localFactionLevels, setLocalFactionLevels] = useState({});

  useEffect(() => {
    setLocalFactionLevels({
      igc: String(factionLevels?.igc ?? 1),
      vlf: String(factionLevels?.vlf ?? 1),
      uics: String(factionLevels?.uics ?? 1),
      player: String(factionLevels?.player ?? 1),
    });
  }, [factionLevels]);

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
                value={localFactionLevels[faction.id] ?? '1'}
                onChange={(e) => setLocalFactionLevels(prev => ({ ...prev, [faction.id]: e.target.value }))}
                onBlur={() => {
                  const val = localFactionLevels[faction.id];
                  if (val === '' || val === undefined || val === null || isNaN(Number(val)) || Number(val) < 1) {
                    onFactionLevelChange(faction.id, '1');
                    setLocalFactionLevels(prev => ({ ...prev, [faction.id]: '1' }));
                  } else {
                    onFactionLevelChange(faction.id, val);
                  }
                }}
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
          const marked = item.markedQuantity || 0;

          return (
            <div
              key={item.id}
              className={`flex items-start gap-2 p-3 rounded-lg transition-all border
                         ${isChecked
                           ? 'bg-status-ready/10 border-status-ready/30'
                           : 'bg-tactical-card border-tactical-border hover:bg-tactical-elevated'}`}
            >
              <label className="flex items-start gap-2 flex-1 min-w-0 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => onToggleItem(item.id)}
                  className="checkbox-custom mt-0.5"
                />
                <div className="flex-1 min-w-0">
                  <span className={`text-sm truncate block ${isChecked ? 'text-status-ready' : 'text-tactical-text'}`}>
                    {item.name}
                  </span>
                  <span className="text-xs text-tactical-muted">
                    {upgradeCount} upgrade{upgradeCount !== 1 ? 's' : ''} • Submitted: {marked.toLocaleString()}/{item.totalRequired.toLocaleString()}
                    <span className="hidden sm:inline"> • Remaining: <span className={marked >= item.totalRequired ? 'text-status-ready' : 'text-status-locked'}>{(item.totalRequired - marked).toLocaleString()}</span></span>
                  </span>
                  <span className="text-xs text-tactical-muted block sm:hidden mt-0.5">
                    Remaining: <span className={marked >= item.totalRequired ? 'text-status-ready' : 'text-status-locked'}>{(item.totalRequired - marked).toLocaleString()}</span>
                  </span>
                </div>
                {isChecked && (
                  <Check className="w-4 h-4 text-status-ready flex-shrink-0 mt-0.5" />
                )}
              </label>
              <button
                onClick={() => setOverlayItem(item)}
                className="p-2 rounded hover:bg-tactical-elevated transition-colors text-tactical-muted hover:text-status-accent flex-shrink-0"
                title="Show upgrade details"
              >
                <Info className="w-5 h-5" />
              </button>
            </div>
          );
        })}
      </div>

      {items.length === 0 && (
        <div className="text-center py-8 text-tactical-muted">
          No items to track. Import upgrade data first.
        </div>
      )}

      {overlayItem && (
        <ItemUpgradesOverlay
          item={overlayItem}
          upgrades={getItemUpgradeDetails ? getItemUpgradeDetails(overlayItem.id) : []}
          onClose={() => setOverlayItem(null)}
        />
      )}
    </div>
  );
}