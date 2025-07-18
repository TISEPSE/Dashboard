// Supprimer les erreurs de dev build indicator qui peuvent causer des problèmes
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  const originalError = console.error;
  console.error = (...args) => {
    // Filtrer les erreurs spécifiques au dev build indicator
    if (
      args[0] && 
      typeof args[0] === 'string' && 
      (
        args[0].includes('dev-build-indicator') ||
        args[0].includes('forceStoreRerender') ||
        args[0].includes('enqueueConcurrentRenderForLane') ||
        args[0].includes('getRootForUpdatedFiber')
      )
    ) {
      return; // Ne pas afficher ces erreurs
    }
    originalError.apply(console, args);
  };
}