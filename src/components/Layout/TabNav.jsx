import { ListChecks, Package, Settings } from 'lucide-react';

export function TabNav({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'upgrades', label: 'Upgrades', icon: ListChecks },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="flex border-b border-tactical-border bg-tactical-card sticky top-0 z-10">
      {tabs.map(tab => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 
                       text-sm font-medium transition-all relative
                       ${isActive 
                         ? 'text-status-ready' 
                         : 'text-tactical-muted hover:text-tactical-text'}`}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{tab.label}</span>
            {isActive && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-status-ready" />
            )}
          </button>
        );
      })}
    </nav>
  );
}