import { useMemo } from 'react';
import { Search, Filter, CheckCircle, Lock, Wrench } from 'lucide-react';
import { UpgradeCard } from './UpgradeCard';
import { useLocalStorage } from '../../hooks/useLocalStorage';

export function UpgradeList({
  upgrades,
  categories,
  getUpgradeStatus,
  getUpgradeProgress,
  getPrerequisitesInfo,
  getFactionsInfo,
  getItemsInfo,
  onToggleItem,
  onToggleBuilt,
  isBuiltUpgrade
}) {
  const [searchQuery, setSearchQuery] = useLocalStorage('irr-filters-search', '');
  const [selectedCategory, setSelectedCategory] = useLocalStorage('irr-filters-category', 'all');
  const [showReady, setShowReady] = useLocalStorage('irr-filters-show-ready', true);
  const [showLocked, setShowLocked] = useLocalStorage('irr-filters-show-locked', true);
  const [showBuilt, setShowBuilt] = useLocalStorage('irr-filters-show-built', true);

  const filteredUpgrades = useMemo(() => {
    let result = upgrades;

    if (selectedCategory !== 'all') {
      result = result.filter(u => u.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(u => u.name.toLowerCase().includes(query));
    }

    result = result.filter(upgrade => {
      const status = getUpgradeStatus(upgrade);
      const built = isBuiltUpgrade ? isBuiltUpgrade(upgrade.id) : false;

      if (built && !showBuilt) return false;
      if (status === 'ready' && !built && !showReady) return false;
      if (status === 'locked' && !showLocked) return false;
      return true;
    });

    return result;
  }, [upgrades, selectedCategory, searchQuery, showReady, showLocked, showBuilt, getUpgradeStatus, isBuiltUpgrade]);

  const getCategoryName = (catId) => {
    const cat = categories.find(c => c.id === catId);
    return cat ? cat.name : catId;
  };

  return (
    <div className="p-4 space-y-4 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tactical-muted" />
          <input
            type="text"
            placeholder="Search upgrades..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-dark w-full pl-10"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tactical-muted" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="input-dark pl-10 pr-8 appearance-none cursor-pointer min-w-[150px]"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => setShowBuilt(!showBuilt)}
          className={`flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg border text-xs font-medium transition-all
                     ${showBuilt
                       ? 'bg-status-accent/15 border-status-accent text-status-accent'
                       : 'bg-tactical-elevated border-tactical-border text-tactical-muted'}`}
        >
          <Wrench className="w-4 h-4" />
          Built
        </button>
        <button
          onClick={() => setShowReady(!showReady)}
          className={`flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg border text-xs font-medium transition-all
                     ${showReady
                       ? 'bg-status-ready/15 border-status-ready text-status-ready'
                       : 'bg-tactical-elevated border-tactical-border text-tactical-muted'}`}
        >
          <CheckCircle className="w-4 h-4" />
          Ready
        </button>
        <button
          onClick={() => setShowLocked(!showLocked)}
          className={`flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg border text-xs font-medium transition-all
                     ${showLocked
                       ? 'bg-status-locked/15 border-status-locked text-status-locked'
                       : 'bg-tactical-elevated border-tactical-border text-tactical-muted'}`}
        >
          <Lock className="w-4 h-4" />
          Locked
        </button>
      </div>

      {selectedCategory !== 'all' && (
        <div className="text-sm text-tactical-muted">
          Showing: {getCategoryName(selectedCategory)} ({filteredUpgrades.length})
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 max-w-5xl mx-auto">
        {filteredUpgrades.map(upgrade => {
          const status = getUpgradeStatus(upgrade);
          const progress = getUpgradeProgress(upgrade);
          const prerequisites = getPrerequisitesInfo(upgrade);
          const factions = getFactionsInfo(upgrade);
          const items = getItemsInfo(upgrade);
          const built = isBuiltUpgrade ? isBuiltUpgrade(upgrade.id) : false;

          return (
            <UpgradeCard
              key={upgrade.id}
              upgrade={upgrade}
              status={status}
              progress={progress}
              prerequisites={prerequisites}
              factions={factions}
              items={items}
              built={built}
              onToggleItem={onToggleItem}
              onToggleBuilt={onToggleBuilt}
            />
          );
        })}
      </div>

      {filteredUpgrades.length === 0 && (
        <div className="text-center py-8 text-tactical-muted">
          No upgrades found matching your criteria.
        </div>
      )}
    </div>
  );
}