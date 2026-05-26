import { useState, useCallback, useEffect, useRef } from 'react';

const API_BASE = '/api';

export function useCloudSave() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [syncStatus, setSyncStatus] = useState('idle');
  const saveTimerRef = useRef(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const savedToken = localStorage.getItem('irr-cloud-token');
    const savedUsername = localStorage.getItem('irr-cloud-username');
    if (savedToken && savedUsername) {
      setUser({ token: savedToken, username: savedUsername });
    }
  }, []);

  const apiRequest = useCallback(async (path, options = {}) => {
    const url = `${API_BASE}${path}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Request failed with status ${response.status}`);
      }

      return data;
    } finally {
      clearTimeout(timeoutId);
    }
  }, []);

  const login = useCallback(async (username, password) => {
    setLoading(true);
    setError(null);

    try {
      const data = await apiRequest('/auth', {
        method: 'POST',
        body: JSON.stringify({ action: 'login', username, password }),
      });

      const userData = { token: data.token, username: data.username };
      setUser(userData);
      localStorage.setItem('irr-cloud-token', data.token);
      localStorage.setItem('irr-cloud-username', data.username);
      setError(null);
      return userData;
    } catch (err) {
      const msg = err.message;
      if (!mountedRef.current) return null;
      setError(msg);
      return null;
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [apiRequest]);

  const register = useCallback(async (username, password) => {
    setLoading(true);
    setError(null);

    try {
      await apiRequest('/auth', {
        method: 'POST',
        body: JSON.stringify({ action: 'register', username, password }),
      });
      setError(null);
      return true;
    } catch (err) {
      if (!mountedRef.current) return false;
      setError(err.message);
      return false;
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [apiRequest]);

  const logout = useCallback(() => {
    setUser(null);
    setError(null);
    setLastSavedAt(null);
    setSyncStatus('idle');
    localStorage.removeItem('irr-cloud-token');
    localStorage.removeItem('irr-cloud-username');
  }, []);

  const loadSave = useCallback(async () => {
    const token = localStorage.getItem('irr-cloud-token');
    if (!token) return null;

    setLoading(true);
    try {
      const data = await apiRequest('/save', {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!mountedRef.current) return null;
      setLoading(false);
      return data;
    } catch (err) {
      if (!mountedRef.current) return null;
      if (err.message.includes('401') || err.message.includes('Invalid session')) {
        logout();
      }
      setLoading(false);
      return null;
    }
  }, [apiRequest, logout]);

  const saveData = useCallback(async (inventory) => {
    const token = localStorage.getItem('irr-cloud-token');
    if (!token) return;

    setSyncStatus('saving');

    try {
      const result = await apiRequest('/save', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          items: inventory.items || {},
          globalItems: inventory.globalItems || {},
          factionLevels: inventory.factionLevels || { igc: 1, vlf: 1, uics: 1, player: 1 },
          builtUpgrades: inventory.builtUpgrades || {},
        }),
      });
      if (!mountedRef.current) return;
      setLastSavedAt(result.savedAt);
      setSyncStatus('saved');
    } catch (err) {
      if (!mountedRef.current) return;
      if (err.message.includes('401') || err.message.includes('Invalid session')) {
        logout();
      }
      setSyncStatus('error');
    }
  }, [apiRequest, logout]);

  const scheduleSave = useCallback((inventory) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    setSyncStatus('unsaved');

    saveTimerRef.current = setTimeout(() => {
      saveData(inventory);
    }, 2000);
  }, [saveData]);

  return {
    user,
    loading,
    error,
    lastSavedAt,
    syncStatus,
    login,
    register,
    logout,
    loadSave,
    saveData,
    scheduleSave,
    clearError: () => setError(null),
  };
}
