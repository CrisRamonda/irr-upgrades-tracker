import { Crosshair } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-tactical-card border-b border-tactical-border px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-status-ready/20 rounded-lg">
          <Crosshair className="w-6 h-6 text-status-ready" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-tactical-text tracking-wide">
            IRR UPGRADES
          </h1>
          <p className="text-xs text-tactical-muted">SafeHouse Tracker</p>
        </div>
      </div>
    </header>
  );
}