import { useState, useRef } from 'react';
import { Download, Upload, Trash2, AlertTriangle, Copy, Check } from 'lucide-react';

export function SettingsPanel({ inventory, onImport, onReset }) {
  const [importData, setImportData] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef(null);

  const handleExport = () => {
    const data = JSON.stringify(inventory, null, 2);

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(data).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }).catch(() => {
        fallbackCopy(data);
      });
    } else {
      fallbackCopy(data);
    }
  };

  const fallbackCopy = (text) => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      alert('Failed to copy. Please select and copy manually.');
    }
    document.body.removeChild(textarea);
  };

  const handleImport = () => {
    try {
      const parsed = JSON.parse(importData);
      onImport(parsed);
      setImportData('');
      alert('Data imported successfully!');
    } catch (e) {
      alert('Invalid JSON format. Please check your data.');
    }
  };

  const handleReset = () => {
    onReset();
    setShowResetConfirm(false);
  };

  return (
    <div className="p-4 space-y-6">
      <div className="card-tactical p-4">
        <div className="flex items-center gap-2 mb-4">
          <Download className="w-5 h-5 text-status-accent" />
          <h2 className="text-tactical-text font-bold">Export Data</h2>
        </div>
        <p className="text-sm text-tactical-muted mb-3">
          Copy your current progress to share or backup.
        </p>
        <button
          onClick={handleExport}
          className={`btn-primary w-full flex items-center justify-center gap-2 ${copied ? 'bg-status-ready' : ''}`}
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copied!' : 'Copy to Clipboard'}
        </button>
      </div>

      <div className="card-tactical p-4">
        <div className="flex items-center gap-2 mb-4">
          <Upload className="w-5 h-5 text-status-accent" />
          <h2 className="text-tactical-text font-bold">Import Data</h2>
        </div>
        <p className="text-sm text-tactical-muted mb-3">
          Paste previously exported data to restore progress.
        </p>
        <textarea
          value={importData}
          onChange={(e) => setImportData(e.target.value)}
          placeholder='Paste JSON here...'
          className="input-dark w-full h-32 resize-none font-mono text-xs"
        />
        <button
          onClick={handleImport}
          disabled={!importData.trim()}
          className="btn-primary w-full mt-3 flex items-center justify-center gap-2
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Upload className="w-4 h-4" />
          Import Data
        </button>
      </div>

      <div className="card-tactical p-4 border-status-locked/30">
        <div className="flex items-center gap-2 mb-4">
          <Trash2 className="w-5 h-5 text-status-locked" />
          <h2 className="text-tactical-text font-bold">Reset Progress</h2>
        </div>
        <p className="text-sm text-tactical-muted mb-3">
          Clear all collected items and start fresh.
        </p>

        {!showResetConfirm ? (
          <button
            onClick={() => setShowResetConfirm(true)}
            className="btn-danger w-full flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Reset All Progress
          </button>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-status-locked text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span>Are you sure? This cannot be undone.</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 bg-tactical-elevated text-tactical-text py-2 rounded 
                           hover:bg-tactical-border transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                className="flex-1 btn-danger"
              >
                Yes, Reset
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="card-tactical p-4">
        <h3 className="text-tactical-text font-bold mb-2">About</h3>
        <p className="text-xs text-tactical-muted">
          IRR Upgrades Tracker v1.0.0<br />
          SafeHouse upgrade tracking for Incursion Red River
        </p>
      </div>
    </div>
  );
}