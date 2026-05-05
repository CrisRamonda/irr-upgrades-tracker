import { useMemo } from 'react';
import upgradesData from '../data/upgrades.json';

export function useUpgrades(inventory) {
  const upgrades = upgradesData.upgrades;
  const categories = upgradesData.categories;

  const getAllUpgradesStatus = useMemo(() => {
    const statusMap = {};

    upgrades.forEach(upgrade => {
      statusMap[upgrade.id] = null;
    });

    const calculateStatus = (upgradeId) => {
      const upgrade = upgrades.find(u => u.id === upgradeId);
      if (!upgrade) return 'locked';

      const prereqs = upgrade.requirements.prerequisites || [];
      const factions = upgrade.requirements.factions || [];
      const items = upgrade.requirements.items || [];

      const prereqsMet = prereqs.every(prereqId => calculateStatus(prereqId) === 'ready');

      const factionsMet = factions.every(f => {
        if (f.factionId === 'player') {
          return inventory.factionLevels?.[f.factionId] >= f.level;
        }
        return true;
      });

      const itemsMet = items.every(item => inventory.items?.[upgrade.id]?.[item.itemId]);

      if (!prereqsMet) return 'locked';
      if (!factionsMet) return 'locked';
      if (itemsMet) return 'ready';
      return 'available';
    };

    upgrades.forEach(upgrade => {
      statusMap[upgrade.id] = calculateStatus(upgrade.id);
    });

    return statusMap;
  }, [inventory.items, inventory.factionLevels]);

  const getUpgradeStatus = (upgrade) => {
    return getAllUpgradesStatus[upgrade.id] || 'locked';
  };

  const getUpgradeProgress = (upgrade) => {
    const items = upgrade.requirements.items || [];
    if (items.length === 0) return { current: 0, total: 0, percentage: 0 };

    const current = items.filter(item => inventory.items?.[upgrade.id]?.[item.itemId]).length;
    const total = items.length;
    const percentage = Math.round((current / total) * 100);

    return { current, total, percentage };
  };

  const getPrerequisitesInfo = (upgrade) => {
    return (upgrade.requirements.prerequisites || []).map(prereqId => {
      const prereq = upgrades.find(u => u.id === prereqId);
      const status = getAllUpgradesStatus[prereqId];
      return {
        id: prereqId,
        name: prereq ? prereq.name : prereqId,
        isCompleted: status === 'ready'
      };
    });
  };

  const getFactionsInfo = (upgrade) => {
    return (upgrade.requirements.factions || []).map(f => ({
      name: f.name,
      level: f.level,
      currentLevel: inventory.factionLevels?.[f.factionId] || 0,
      isMet: f.factionId === 'player' 
        ? (inventory.factionLevels?.player || 0) >= f.level
        : true
    }));
  };

  const getItemsInfo = (upgrade) => {
    return (upgrade.requirements.items || []).map(item => ({
      ...item,
      hasItem: !!inventory.items?.[upgrade.id]?.[item.itemId]
    }));
  };

  const filterByCategory = (categoryId) => {
    if (!categoryId || categoryId === 'all') return upgrades;
    return upgrades.filter(u => u.category === categoryId);
  };

  const searchUpgrades = (query, categoryId) => {
    let results = filterByCategory(categoryId);
    if (query) {
      const lowerQuery = query.toLowerCase();
      results = results.filter(u => u.name.toLowerCase().includes(lowerQuery));
    }
    return results;
  };

  const getCategoriesWithCount = () => {
    return categories.map(cat => ({
      ...cat,
      count: upgrades.filter(u => u.category === cat.id).length
    }));
  };

  return {
    upgrades,
    categories,
    getUpgradeStatus,
    getUpgradeProgress,
    getPrerequisitesInfo,
    getFactionsInfo,
    getItemsInfo,
    filterByCategory,
    searchUpgrades,
    getCategoriesWithCount
  };
}