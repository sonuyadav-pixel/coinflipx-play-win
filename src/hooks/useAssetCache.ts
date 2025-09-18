import { useEffect } from 'react';
import { preloadAssets, registerServiceWorker } from '@/utils/assetPreloader';

// Asset preloader hook for critical game assets
export const useAssetPreloader = () => {
  useEffect(() => {
    registerServiceWorker();
    preloadAssets();
  }, []);
};