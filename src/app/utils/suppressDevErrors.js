// Supprimer les erreurs de dev build indicator qui peuvent causer des problèmes
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  const originalError = console.error;
  const originalWarn = console.warn;
  
  console.error = (...args) => {
    // Filtrer les erreurs spécifiques au dev build indicator et React
    if (
      args[0] && 
      typeof args[0] === 'string' && 
      (
        args[0].includes('dev-build-indicator') ||
        args[0].includes('forceStoreRerender') ||
        args[0].includes('enqueueConcurrentRenderForLane') ||
        args[0].includes('getRootForUpdatedFiber') ||
        args[0].includes('enqueueConcurrentHookUpdate') ||
        args[0].includes('dispatchSetState') ||
        args[0].includes('commitAttachRef') ||
        args[0].includes('commitLayoutEffectOnFiber') ||
        args[0].includes('recursivelyTraverseLayoutEffects') ||
        args[0].includes('flushLayoutEffects') ||
        args[0].includes('commitRoot') ||
        args[0].includes('performWorkOnRoot') ||
        args[0].includes('performWorkUntilDeadline') ||
        args[0].includes('DevOverlay') ||
        args[0].includes('AppDevOverlay') ||
        args[0].includes('HotReload') ||
        args[0].includes('AppRouter') ||
        args[0].includes('ServerRoot') ||
        args[0].includes('RenderRuntimeError') ||
        args[0].includes('RenderError') ||
        args[0].includes('error-overlay-pagination')
      )
    ) {
      return; // Ne pas afficher ces erreurs
    }
    originalError.apply(console, args);
  };
  
  console.warn = (...args) => {
    // Filtrer les warnings similaires
    if (
      args[0] && 
      typeof args[0] === 'string' && 
      (
        args[0].includes('dev-build-indicator') ||
        args[0].includes('DevOverlay') ||
        args[0].includes('HotReload')
      )
    ) {
      return; // Ne pas afficher ces warnings
    }
    originalWarn.apply(console, args);
  };
}