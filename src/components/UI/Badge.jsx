export function Badge({ children, variant = 'default', className = '' }) {
  const variants = {
    default: 'bg-tactical-elevated text-tactical-muted border-tactical-border',
    ready: 'bg-status-ready/20 text-status-ready border-status-ready/50',
    available: 'bg-status-available/20 text-status-available border-status-available/50',
    locked: 'bg-status-locked/20 text-status-locked border-status-locked/50',
    faction: 'bg-status-accent/20 text-status-accent border-status-accent/50',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium 
                      border ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}