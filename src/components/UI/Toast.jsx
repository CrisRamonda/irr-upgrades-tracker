import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export function Toast({ toasts, onDismiss }) {
  if (toasts.length === 0) return null;

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-status-ready" />,
    error: <AlertCircle className="w-5 h-5 text-status-locked" />,
    info: <Info className="w-5 h-5 text-status-accent" />
  };

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className="bg-tactical-elevated border border-tactical-border rounded-lg 
                     px-4 py-3 flex items-center gap-3 shadow-lg animate-slide-in"
        >
          {icons[toast.type] || icons.success}
          <span className="text-tactical-text text-sm font-medium">{toast.message}</span>
          <button
            onClick={() => onDismiss(toast.id)}
            className="text-tactical-muted hover:text-tactical-text transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}