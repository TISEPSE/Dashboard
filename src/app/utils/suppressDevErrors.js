// Supprimer seulement les erreurs spécifiques aux overlays de développement
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  const originalError = console.error;
  
  console.error = (...args) => {
    // Filtrer seulement les erreurs très spécifiques aux overlays
    if (
      args[0] && 
      typeof args[0] === 'string' && 
      (
        args[0].includes('use-minimum-loading-time-multiple') ||
        args[0].includes('dev-tools-indicator') ||
        args[0].includes('createConsoleError') ||
        args[0].includes('handleConsoleError')
      )
    ) {
      return; // Ne pas afficher ces erreurs spécifiques
    }
    
    originalError.apply(console, args);
  };
}