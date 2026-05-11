import { useState, useEffect, useCallback, useMemo } from 'react';
import { Header } from './components/Layout/Header';
import { TabNav } from './components/Layout/TabNav';
import { UpgradeList } from './components/Upgrades/UpgradeList';
import { InventoryPanel } from './components/Inventory/InventoryPanel';
import { SettingsPanel } from './components/Settings/SettingsPanel';
import { Toast } from './components/UI/Toast';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useUpgrades } from './hooks/useUpgrades';
import { useToast } from './hooks/useToast';
import upgradesData from './data/upgrades.json';

function App() {
  const [activeTab, setActiveTab] = useState('upgrades');

  const [inventory, setInventory] = useLocalStorage('irr-inventory-v1', {
    items: {},
    globalItems: {},
    completedUpgrades: {},
    factionLevels: { igc: 1, vlf: 1, uics: 1, player: 1 }
  });

  useEffect(() => {
    setInventory(prev => {
      if (prev.factionLevels?.igc === undefined || prev.factionLevels?.igc === 0) {
        return {
          ...prev,
          factionLevels: { igc: 1, vlf: 1, uics: 1, player: 1 }
        };
      }
      return prev;
    });
  }, []);

  const { toasts, showToast, dismissToast } = useToast();

  const upgradesHook = useUpgrades(inventory);

  const [previouslyReady, setPreviouslyReady] = useState({});

  const handleFactionLevelChange = useCallback((factionId, level) => {
    const numLevel = Math.max(0, parseInt(level) || 0);
    setInventory(prev => ({
      ...prev,
      factionLevels: {
        ...prev.factionLevels,
        [factionId]: numLevel
      }
    }));
  }, [setInventory]);

  const getUpgradesForItem = useCallback((itemId) => {
    return upgradesData.upgrades
      .filter(upg => upg.requirements.items.some(i => i.itemId === itemId))
      .map(upg => upg.id);
  }, []);

  const handleToggleItemInUpgrade = useCallback((upgradeId, itemId) => {
    setInventory(prev => {
      const newItems = {
        ...prev.items,
        [upgradeId]: {
          ...(prev.items?.[upgradeId] || {}),
          [itemId]: !(prev.items?.[upgradeId]?.[itemId])
        }
      };

      const affectedUpgrades = getUpgradesForItem(itemId);
      const allMarked = affectedUpgrades.every(upgId => newItems[upgId]?.[itemId]);

      return {
        ...prev,
        items: newItems,
        globalItems: {
          ...prev.globalItems,
          [itemId]: allMarked
        }
      };
    });
  }, [setInventory, getUpgradesForItem]);

  const handleToggleGlobalItem = useCallback((itemId) => {
    const upgradesToMark = getUpgradesForItem(itemId);

    setInventory(prev => {
      const newItems = { ...prev.items };

      upgradesToMark.forEach(upgradeId => {
        newItems[upgradeId] = {
          ...(newItems[upgradeId] || {}),
          [itemId]: !prev.globalItems?.[itemId]
        };
      });

      return {
        ...prev,
        items: newItems,
        globalItems: {
          ...prev.globalItems,
          [itemId]: !prev.globalItems?.[itemId]
        }
      };
    });
  }, [setInventory, getUpgradesForItem]);

  const isGlobalItemChecked = useCallback((itemId) => {
    return !!inventory.globalItems?.[itemId];
  }, [inventory.globalItems]);

  useEffect(() => {
    const currentReadyUpgrades = upgradesHook.upgrades.filter(u =>
      upgradesHook.getUpgradeStatus(u) === 'ready'
    ).map(u => u.id);

    currentReadyUpgrades.forEach(upgradeId => {
      if (!previouslyReady[upgradeId]) {
        const upgrade = upgradesHook.upgrades.find(u => u.id === upgradeId);
        if (upgrade) {
          showToast(`✓ ${upgrade.name} ready to build!`, 'success');
        }
      }
    });

    const newPreviouslyReady = {};
    currentReadyUpgrades.forEach(id => {
      newPreviouslyReady[id] = true;
    });
    setPreviouslyReady(newPreviouslyReady);
  }, [inventory, upgradesHook, showToast, previouslyReady]);

  const handleImport = (data) => {
    const importedItems = data.items || {};
    const importedGlobalItems = data.globalItems || {};
    const importedFactionLevels = data.factionLevels || {
      igc: 1, vlf: 1, uics: 1, player: 1
    };

    const newGlobalItems = { ...importedGlobalItems };
    const allItemIds = new Set();
    upgradesData.upgrades.forEach(upg => {
      upg.requirements.items.forEach(item => {
        allItemIds.add(item.itemId);
      });
    });

    allItemIds.forEach(itemId => {
      if (newGlobalItems[itemId] === undefined) {
        const upgradesWithItem = upgradesData.upgrades
          .filter(upg => upg.requirements.items.some(i => i.itemId === itemId))
          .map(upg => upg.id);

        const allMarked = upgradesWithItem.every(upgId =>
          importedItems[upgId]?.[itemId] === true
        );

        if (allMarked) {
          newGlobalItems[itemId] = true;
        }
      }
    });

    setInventory(prev => ({
      items: importedItems,
      globalItems: newGlobalItems,
      completedUpgrades: data.completedUpgrades || prev.completedUpgrades,
      factionLevels: importedFactionLevels
    }));
  };

  const handleReset = () => {
    setInventory({
      items: {},
      globalItems: {},
      completedUpgrades: {},
      factionLevels: { igc: 1, vlf: 1, uics: 1, player: 1 }
    });
    setPreviouslyReady({});
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'upgrades':
        return (
          <UpgradeList
            upgrades={upgradesHook.upgrades}
            categories={upgradesHook.categories}
            getUpgradeStatus={upgradesHook.getUpgradeStatus}
            getUpgradeProgress={upgradesHook.getUpgradeProgress}
            getPrerequisitesInfo={upgradesHook.getPrerequisitesInfo}
            getFactionsInfo={upgradesHook.getFactionsInfo}
            getItemsInfo={upgradesHook.getItemsInfo}
            onToggleItem={handleToggleItemInUpgrade}
          />
        );
      case 'inventory':
        const itemTotals = {};
        const itemRequiredUpgrades = {};

        upgradesData.upgrades.forEach(upg => {
          upg.requirements.items.forEach(item => {
            if (!itemTotals[item.itemId]) {
              const itemDef = upgradesData.items.find(i => i.id === item.itemId);
              itemTotals[item.itemId] = {
                id: item.itemId,
                name: itemDef ? itemDef.name : item.itemId,
                totalRequired: 0
              };
              itemRequiredUpgrades[item.itemId] = [];
            }
            itemTotals[item.itemId].totalRequired += item.quantity;
            if (!itemRequiredUpgrades[item.itemId].includes(upg.id)) {
              itemRequiredUpgrades[item.itemId].push(upg.id);
            }
          });
        });

        const allItemsList = Object.values(itemTotals).sort((a, b) => a.name.localeCompare(b.name));
        const totalRequired = allItemsList.reduce((sum, item) => sum + item.totalRequired, 0);

        const collected = allItemsList.filter(item =>
          isGlobalItemChecked(item.id)
        ).length;
        const percentage = allItemsList.length > 0 ? Math.round((collected / allItemsList.length) * 100) : 0;

        return (
          <InventoryPanel
            items={allItemsList}
            stats={{ total: totalRequired, collected: collected, percentage: percentage }}
            onToggleItem={handleToggleGlobalItem}
            isItemChecked={isGlobalItemChecked}
            itemRequiredUpgrades={itemRequiredUpgrades}
            factionLevels={inventory.factionLevels}
            onFactionLevelChange={handleFactionLevelChange}
          />
        );
      case 'settings':
        return (
          <SettingsPanel
            inventory={inventory}
            onImport={handleImport}
            onReset={handleReset}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-tactical-bg">
      <Header />
      <TabNav activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="pb-8">
        {renderContent()}
      </main>
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

export default App;