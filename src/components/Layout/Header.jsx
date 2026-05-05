export function Header() {
  return (
    <header className="bg-tactical-card border-b border-tactical-border px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 flex items-center justify-center bg-status-ready/20 rounded-lg overflow-hidden">
          <img 
            src="/logo.png" 
            alt="IRR Logo" 
            className="max-w-full max-h-full w-auto h-auto object-contain"
          />
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