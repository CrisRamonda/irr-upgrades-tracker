import { useLocalStorage } from './useLocalStorage';
import upgradesData from '../data/upgrades.json';

export function useInventory() {
  const [inventory, setInventory] = useLocalStorage('irr-inventory', {});

  const allItems = upgradesData.items;

  const getAllRequiredItems = () => {
    const requiredItems = new Set();
    upgradesData.upgrades.forEach(upgrade => {
      upgrade.requirements.items.forEach(item => {
        requiredItems.add(item.itemId);
      });
    });
    return Array.from(requiredItems).map(id => {
      const itemDef = allItems.find(i => i.id === id);
      return {
        id,
        name: itemDef ? itemDef.name : id,
        hasItem: !!inventory[id]
      };
    }).sort((a, b) => a.name.localeCompare(b.name));
  };

  const toggleItem = (itemId) => {
    setInventory(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const setItem = (itemId, value) => {
    setInventory(prev => ({
      ...prev,
      [itemId]: value
    }));
  };

  const hasItem = (itemId) => !!inventory[itemId];

  const getStats = () => {
    const items = getAllRequiredItems();
    const total = items.length;
    const collected = items.filter(i => i.hasItem).length;
    return { total, collected, percentage: total > 0 ? Math.round((collected / total) * 100) : 0 };
  };

  return {
    inventory,
    toggleItem,
    setItem,
    hasItem,
    getAllRequiredItems,
    getStats
  };
}