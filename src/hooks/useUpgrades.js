import { useMemo } from 'react';
import upgradesData from '../data/upgrades.json';

export function useUpgrades(inventory) {
  const upgrades = upgradesData.upgrades;
  const categories = upgradesData.categories;

  const getAllUpgradesStatus = useMemo(() => {
    if (!inventory) return {};

    const statusMap = {};
    const calculating = new Set();

    const calculateStatus = (upgradeId) => {
      if (calculating.has(upgradeId)) return 'locked';
      if (statusMap[upgradeId] !== undefined) return statusMap[upgradeId];

      calculating.add(upgradeId);

      const upgrade = upgrades.find(u => u.id === upgradeId);
      if (!upgrade) {
        calculating.delete(upgradeId);
        return 'locked';
      }

      const prereqs = upgrade.requirements?.prerequisites || [];
      const factions = upgrade.requirements?.factions || [];
      const items = upgrade.requirements?.items || [];

      const prereqsMet = prereqs.every(prereqId => calculateStatus(prereqId) === 'ready');

      const factionsMet = factions.every(f => {
        const currentLevel = inventory.factionLevels?.[f.factionId] ?? 0;
        return currentLevel >= f.level;
      });

      const itemsMet = items.every(item =>
        inventory.items?.[upgradeId]?.[item.itemId] === true
      );

      const result = !prereqsMet || !factionsMet ? 'locked' :
                     itemsMet ? 'ready' : 'available';

      statusMap[upgradeId] = result;
      calculating.delete(upgradeId);

      return result;
    };

    upgrades.forEach(upgrade => {
      if (statusMap[upgrade.id] === undefined) {
        calculateStatus(upgrade.id);
      }
    });

    return statusMap;
  }, [inventory?.items, inventory?.factionLevels]);

  const getUpgradeStatus = (upgrade) => {
    if (!upgrade || !inventory) return 'locked';
    return getAllUpgradesStatus[upgrade.id] || 'locked';
  };

  const getUpgradeProgress = (upgrade) => {
    if (!upgrade || !inventory) return { current: 0, total: 0, percentage: 0 };

    const items = upgrade.requirements?.items || [];
    if (items.length === 0) return { current: 0, total: 0, percentage: 0 };

    const current = items.filter(item =>
      inventory.items?.[upgrade.id]?.[item.itemId] === true
    ).length;
    const total = items.length;
    const percentage = Math.round((current / total) * 100);

    return { current, total, percentage };
  };

  const getPrerequisitesInfo = (upgrade) => {
    if (!upgrade) return [];

    return (upgrade.requirements?.prerequisites || []).map(prereqId => {
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
    if (!upgrade) return [];

    return (upgrade.requirements?.factions || []).map(f => ({
      name: f.name,
      level: f.level,
      currentLevel: inventory?.factionLevels?.[f.factionId] ?? 0,
      isMet: (inventory?.factionLevels?.[f.factionId] ?? 0) >= f.level
    }));
  };

  const getItemsInfo = (upgrade) => {
    if (!upgrade) return [];

    return (upgrade.requirements?.items || []).map(item => ({
      ...item,
      hasItem: inventory?.items?.[upgrade.id]?.[item.itemId] === true
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