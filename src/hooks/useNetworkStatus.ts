import { useState, useEffect } from 'react';
import { networkService } from '../services/networkService';
import type { NetworkState } from '../types/survey';

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState<boolean>(networkService.isCurrentConnected());

  useEffect(() => {
    const unsubscribe = networkService.addListener((connected) => {
      setIsOnline(connected);
    });
    return unsubscribe;
  }, []);

  const networkState: NetworkState = isOnline ? 'ONLINE' : 'OFFLINE';

  return { isOnline, networkState };
}
