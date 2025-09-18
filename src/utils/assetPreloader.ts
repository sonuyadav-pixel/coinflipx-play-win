// Simple asset preloader utility
export const preloadAssets = () => {
  // Preload critical images
  const preloadImages = [
    '/src/assets/golden-coin.png',
    '/src/assets/golden-coin1.png',
    '/src/assets/golden-coin3.png',
    '/src/assets/gold-sparkle.png',
    '/src/assets/hero-srk.jpg'
  ];

  preloadImages.forEach((src) => {
    const img = new Image();
    img.src = src;
  });

  // Preload video
  const video = document.createElement('video');
  video.src = '/src/assets/coin-toss-animation.mp4';
  video.preload = 'auto';
  video.muted = true;
  video.style.display = 'none';
  document.body.appendChild(video);
  
  // Clean up after loading
  video.addEventListener('loadeddata', () => {
    if (document.body.contains(video)) {
      document.body.removeChild(video);
    }
  });

  video.addEventListener('error', () => {
    if (document.body.contains(video)) {
      document.body.removeChild(video);
    }
  });
};

// Register service worker for caching
export const registerServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('Service Worker registered:', registration);
      })
      .catch((error) => {
        console.log('Service Worker registration failed:', error);
      });
  }
};