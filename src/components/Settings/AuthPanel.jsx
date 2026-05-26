import { useState, useEffect } from 'react';
import { Cloud, LogOut, CloudOff, Upload, AlertTriangle, Check } from 'lucide-react';

export function AuthPanel({
  user,
  loading,
  error,
  syncStatus,
  lastSavedAt,
  onLogin,
  onRegister,
  onLogout,
  onClearError,
}) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('login');
  const [registered, setRegistered] = useState(false);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(onClearError, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, onClearError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) return;

    if (mode === 'login') {
      onLogin(username.trim(), password);
    } else {
      const ok = await onRegister(username.trim(), password);
      if (ok) {
        setRegistered(true);
        setMode('login');
        setPassword('');
      }
    }
  };

  const syncStatusLabel = {
    idle: '',
    unsaved: 'Unsaved changes...',
    saving: 'Saving to cloud...',
    saved: 'All changes saved',
    error: 'Failed to save',
  };

  if (user) {
    const lastSavedTime = lastSavedAt
      ? new Date(lastSavedAt).toLocaleTimeString()
      : null;

    return (
      <div className="card-tactical p-4">
        <div className="flex items-center gap-2 mb-4">
          <Cloud className="w-5 h-5 text-status-accent" />
          <h2 className="text-tactical-text font-bold">Cloud Save</h2>
        </div>

        <div className="text-sm text-tactical-muted mb-1">
          Logged in as <span className="text-tactical-text font-semibold">{user.username}</span>
        </div>

        {syncStatus && syncStatus !== 'idle' && (
          <div className="flex items-center gap-2 text-xs mb-3">
            {syncStatus === 'saving' && (
              <Upload className="w-3 h-3 text-status-accent animate-pulse" />
            )}
            {syncStatus === 'saved' && (
              <Check className="w-3 h-3 text-status-ready" />
            )}
            {syncStatus === 'error' && (
              <AlertTriangle className="w-3 h-3 text-status-locked" />
            )}
            {syncStatus === 'unsaved' && (
              <CloudOff className="w-3 h-3 text-tactical-muted" />
            )}
            <span className={
              syncStatus === 'saved' ? 'text-status-ready' :
              syncStatus === 'error' ? 'text-status-locked' :
              'text-tactical-muted'
            }>
              {syncStatusLabel[syncStatus]}
            </span>
          </div>
        )}

        {lastSavedTime && (
          <div className="text-xs text-tactical-muted mb-4">
            Last saved at {lastSavedTime}
          </div>
        )}

        <button
          onClick={onLogout}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="card-tactical p-4">
      <div className="flex items-center gap-2 mb-4">
        {mode === 'login' ? (
          <Cloud className="w-5 h-5 text-status-accent" />
        ) : (
          <CloudOff className="w-5 h-5 text-status-accent" />
        )}
        <h2 className="text-tactical-text font-bold">
          {mode === 'login' ? 'Cloud Save' : 'Create Account'}
        </h2>
      </div>

      <p className="text-sm text-tactical-muted mb-3">
        {mode === 'login'
          ? 'Sign in to sync your progress across devices.'
          : 'Create an account to enable cloud saving.'}
      </p>

      {registered && (
        <div className="flex items-center gap-2 text-sm text-status-ready mb-3">
          <Check className="w-4 h-4" />
          Account created. Please log in.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          className="input-dark w-full"
          minLength={3}
          maxLength={30}
          autoComplete="username"
        />

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="input-dark w-full"
          minLength={6}
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
        />

        {error && (
          <div className="flex items-start gap-2 text-sm text-status-locked">
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !username.trim() || !password}
          className="btn-primary w-full flex items-center justify-center gap-2
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Upload className="w-4 h-4 animate-spin" />
              {mode === 'login' ? 'Signing in...' : 'Creating account...'}
            </>
          ) : (
            <>
              {mode === 'login' ? <Cloud className="w-4 h-4" /> : <CloudOff className="w-4 h-4" />}
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </>
          )}
        </button>
      </form>

      <div className="mt-4 text-center">
        <button
          onClick={() => {
            setMode(mode === 'login' ? 'register' : 'login');
            setError(null);
            onClearError();
          }}
          className="text-sm text-status-accent hover:underline"
        >
          {mode === 'login'
            ? "Don't have an account? Register"
            : 'Already have an account? Sign In'}
        </button>
      </div>
    </div>
  );
}
