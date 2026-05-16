import { useState, useEffect, useCallback } from 'react';
import type { ProfileData } from '../types/profile';
import { profileApi, ApiError } from '../lib/api';

type State =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: ProfileData }
  | { status: 'error'; message: string };

export function useProfile() {
  const [state, setState] = useState<State>({ status: 'idle' });

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const data = await profileApi.getProfile();
      setState({ status: 'success', data });
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : 'Failed to load profile. Tap to retry.';
      setState({ status: 'error', message });
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { state, retry: load };
}
