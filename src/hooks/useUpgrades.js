import { useMemo } from 'react';
import upgradesData from '../data/upgrades.json';

export function useUpgrades(inventory) {
  const upgrades = upgradesData.upgrades;
  const categories = upgradesData.categories;

  const getUpgradeStatus = (upgrade) => {
    const prereqs = upgrade.requirements.prerequisites || [];
    const factions = upgrade.requirements.factions || [];
    const items = upgrade.requirements.items || [];

    const prereqsMet = prereqs.every(prereqId => inventory.completedUpgrades?.[prereqId]);

    const factionsMet = factions.every(f => {
      if (f.factionId === 'player') {
        return inventory.factionLevels?.[f.factionId] >= f.level;
      }
      return inventory.factionLevels?.[f.factionId] >= f.level || true;
    });

    const itemsMet = items.every(item => inventory.items?.[upgrade.id]?.[item.itemId]);

    if (!prereqsMet) return 'locked';
    if (!factionsMet) return 'locked';
    if (itemsMet && prereqsMet) return 'ready';
    return 'available';
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
      const isCompleted = inventory.completedUpgrades?.[prereqId];
      return {
        id: prereqId,
        name: prereq ? prereq.name : prereqId,
        isCompleted: !!isCompleted
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