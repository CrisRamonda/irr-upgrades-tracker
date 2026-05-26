import { useState, useMemo } from 'react';
import { Search, Filter, CheckCircle } from 'lucide-react';
import { UpgradeCard } from './UpgradeCard';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showReady, setShowReady] = useState(true);
  const [showLocked, setShowLocked] = useState(true);
  const [showBuilt, setShowBuilt] = useState(true);

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
    <div className="p-4 space-y-4">
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

      <div className="flex flex-wrap items-center gap-4 text-sm">
        <span className="text-tactical-muted">Filter by status:</span>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showReady}
            onChange={(e) => setShowReady(e.target.checked)}
            className="checkbox-custom"
          />
          <span className="text-status-ready">Show Ready</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showLocked}
            onChange={(e) => setShowLocked(e.target.checked)}
            className="checkbox-custom"
          />
          <span className="text-status-locked">Show Locked</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showBuilt}
            onChange={(e) => setShowBuilt(e.target.checked)}
            className="checkbox-custom"
          />
          <span className="text-status-accent">Show Built</span>
        </label>
      </div>

      {selectedCategory !== 'all' && (
        <div className="text-sm text-tactical-muted">
          Showing: {getCategoryName(selectedCategory)} ({filteredUpgrades.length})
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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