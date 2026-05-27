import { useState, useEffect } from 'react';
import { Package, Check, Shield, Info } from 'lucide-react';
import { ProgressBar } from '../UI/ProgressBar';
import { ItemUpgradesOverlay } from './ItemUpgradesOverlay';
import { formatNumber } from '../../utils/format';

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

  const materialNames = ['concrete', 'food', 'metal', 'oil'];

  const materialItems = items.filter(i => materialNames.includes(i.name.toLowerCase()));
  const otherItems = items.filter(i => !materialNames.includes(i.name.toLowerCase()));

  const makeStats = (list) => {
    const markedQuantity = list.reduce((s, i) => s + (i.markedQuantity || 0), 0);
    const totalRequired = list.reduce((s, i) => s + i.totalRequired, 0);
    return {
      totalRequired,
      markedQuantity,
      percentage: totalRequired > 0 ? Math.round((markedQuantity / totalRequired) * 100) : 0,
    };
  };

  const itemsStats = makeStats(otherItems);
  const materialsStats = makeStats(materialItems);

  return (
    <div className="p-4 space-y-4 max-w-5xl mx-auto">
      <div className="card-tactical p-4">
        <div className="flex items-center gap-3 mb-3">
          <Package className="w-5 h-5 text-status-accent" />
          <h2 className="text-tactical-text font-bold">Inventory</h2>
        </div>
        <div className="space-y-2">
          <div>
            <div className="text-xs text-tactical-muted mb-1">
              Items
            </div>
            <ProgressBar
              current={itemsStats.markedQuantity}
              total={itemsStats.totalRequired}
              percentage={itemsStats.percentage}
            />
          </div>
          <div>
            <div className="text-xs text-tactical-muted mb-1">
              Materials
            </div>
            <ProgressBar
              current={materialsStats.markedQuantity}
              total={materialsStats.totalRequired}
              percentage={materialsStats.percentage}
            />
          </div>
        </div>
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

      {[
        { title: 'Items', items: otherItems },
        { title: 'Materials', items: materialItems },
      ].map(section => (
          <div key={section.title}>
            <h3 className="text-tactical-text font-bold text-sm mb-2 mt-2">
              {section.title}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {section.items.map(item => {
                const isChecked = isItemChecked ? isItemChecked(item.id) : false;
                const upgradeCount = itemRequiredUpgrades ? itemRequiredUpgrades[item.id]?.length || 0 : 0;
                const marked = item.markedQuantity || 0;

                return (
                  <div
                    key={item.id}
                    onClick={() => onToggleItem(item.id)}
                    className={`flex items-center gap-2 p-3 rounded-lg transition-all border cursor-pointer
                               ${isChecked
                                 ? 'bg-status-ready/10 border-status-ready/30'
                                 : 'bg-tactical-card border-tactical-border hover:bg-tactical-elevated'}`}
                  >
                    <div className="flex-1 min-w-0">
                      <span className={`text-sm truncate block ${isChecked ? 'text-status-ready' : 'text-tactical-text'}`}>
                        {item.name}
                      </span>
                      <span className="text-xs text-tactical-muted">
                        {upgradeCount} upgrade{upgradeCount !== 1 ? 's' : ''} • Submitted: {formatNumber(marked)}/{formatNumber(item.totalRequired)}
                        <span className="hidden sm:inline"> • Remaining: <span className={marked >= item.totalRequired ? 'text-status-ready' : 'text-status-locked'}>{formatNumber(item.totalRequired - marked)}</span></span>
                      </span>
                      <span className="text-xs text-tactical-muted block sm:hidden mt-0.5">
                        Remaining: <span className={marked >= item.totalRequired ? 'text-status-ready' : 'text-status-locked'}>{formatNumber(item.totalRequired - marked)}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {isChecked && (
                        <Check className="w-7 h-7 text-status-ready" />
                      )}
                      {!isChecked && (
                        <div className="w-7 h-7" />
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); setOverlayItem(item); }}
                        className="w-7 h-7 flex items-center justify-center rounded hover:bg-tactical-elevated transition-colors text-tactical-muted hover:text-status-accent"
                        title="Show upgrade details"
                      >
                        <Info className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

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
