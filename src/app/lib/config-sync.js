// Système de synchronisation des configurations entre mode web et desktop

class ConfigSync {
  constructor() {
    this.isElectron = typeof window !== 'undefined' && window.electronAPI;
  }

  // === GESTION DES CONFIGURATIONS ===

  async getConfig(key) {
    try {
      if (this.isElectron) {
        // Mode Electron - SQLite local
        return await this.getElectronConfig(key);
      } else {
        // Mode Web - localStorage avec sync serveur
        return await this.getWebConfig(key);
      }
    } catch (error) {
      console.error('Erreur récupération config:', error);
      return null;
    }
  }

  async setConfig(key, value) {
    try {
      if (this.isElectron) {
        // Mode Electron - SQLite local
        await this.setElectronConfig(key, value);
      } else {
        // Mode Web - localStorage + sync serveur
        await this.setWebConfig(key, value);
      }
    } catch (error) {
      console.error('Erreur sauvegarde config:', error);
      throw error;
    }
  }

  // === MODE ELECTRON ===

  async getElectronConfig(key) {
    // Utiliser l'API Electron pour récupérer depuis SQLite
    if (window.electronAPI?.getConfig) {
      return await window.electronAPI.getConfig(key);
    }
    
    // Fallback localStorage
    const stored = localStorage.getItem(`config_${key}`);
    return stored ? JSON.parse(stored) : null;
  }

  async setElectronConfig(key, value) {
    // Sauvegarder dans SQLite via Electron
    if (window.electronAPI?.setConfig) {
      await window.electronAPI.setConfig(key, value);
    }
    
    // Sauvegarder aussi en localStorage pour l'accès immédiat
    localStorage.setItem(`config_${key}`, JSON.stringify(value));
    
    // Émettre un événement pour les autres composants
    window.dispatchEvent(new CustomEvent('configUpdated', { 
      detail: { key, value } 
    }));
  }

  // === MODE WEB ===

  async getWebConfig(key) {
    // D'abord essayer localStorage
    const stored = localStorage.getItem(`config_${key}`);
    if (stored) {
      return JSON.parse(stored);
    }

    // Puis essayer de récupérer depuis le serveur
    try {
      const response = await fetch(`/api/config/${key}`);
      if (response.ok) {
        const data = await response.json();
        // Sauvegarder en local pour la prochaine fois
        localStorage.setItem(`config_${key}`, JSON.stringify(data.value));
        return data.value;
      }
    } catch (error) {
      console.warn('Sync serveur config échouée:', error);
    }

    return null;
  }

  async setWebConfig(key, value) {
    // Sauvegarder immédiatement en localStorage
    localStorage.setItem(`config_${key}`, JSON.stringify(value));
    
    // Émettre un événement pour les autres composants
    window.dispatchEvent(new CustomEvent('configUpdated', { 
      detail: { key, value } 
    }));

    // Essayer de synchroniser avec le serveur en arrière-plan
    try {
      await fetch(`/api/config/${key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value })
      });
    } catch (error) {
      console.warn('Sync serveur config échouée:', error);
      // Marquer pour synchronisation ultérieure
      this.markForSync(key, value);
    }
  }

  // === SYNCHRONISATION DIFFÉRÉE ===

  markForSync(key, value) {
    const pendingSync = JSON.parse(localStorage.getItem('pendingConfigSync') || '{}');
    pendingSync[key] = {
      value,
      timestamp: Date.now()
    };
    localStorage.setItem('pendingConfigSync', JSON.stringify(pendingSync));
  }

  async syncPendingConfigs() {
    const pendingSync = JSON.parse(localStorage.getItem('pendingConfigSync') || '{}');
    
    for (const [key, data] of Object.entries(pendingSync)) {
      try {
        await fetch(`/api/config/${key}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ value: data.value })
        });
        
        // Supprimer de la liste en attente
        delete pendingSync[key];
      } catch (error) {
        console.warn(`Sync échouée pour ${key}:`, error);
      }
    }
    
    localStorage.setItem('pendingConfigSync', JSON.stringify(pendingSync));
  }

  // === CONFIGURATIONS SPÉCIFIQUES ===

  // Configuration de la navbar
  async getNavbarConfig() {
    const config = await this.getConfig('navbar');
    return config || {
      order: ['home', 'crypto', 'message', 'meteo', 'sante', 'finances', 'calendrier'],
      preferences: {
        home: true,
        crypto: true,
        message: true,
        meteo: true,
        sante: true,
        finances: true,
        calendrier: true
      }
    };
  }

  async setNavbarConfig(config) {
    await this.setConfig('navbar', config);
  }

  // Configuration des couleurs du calendrier
  async getCalendarColors() {
    const config = await this.getConfig('calendarColors');
    return config || {};
  }

  async setCalendarColors(colors) {
    await this.setConfig('calendarColors', colors);
  }

  // Configuration générale de l'app
  async getAppSettings() {
    const config = await this.getConfig('appSettings');
    return config || {
      theme: 'dark',
      language: 'fr',
      notifications: true
    };
  }

  async setAppSettings(settings) {
    await this.setConfig('appSettings', settings);
  }

  // === UTILITAIRES ===

  // Écouter les changements de configuration
  onConfigChange(callback) {
    const handler = (event) => {
      callback(event.detail.key, event.detail.value);
    };
    
    window.addEventListener('configUpdated', handler);
    
    // Retourner une fonction de cleanup
    return () => window.removeEventListener('configUpdated', handler);
  }

  // Exporter toutes les configurations
  async exportAllConfigs() {
    const configs = {};
    const keys = ['navbar', 'calendarColors', 'appSettings'];
    
    for (const key of keys) {
      configs[key] = await this.getConfig(key);
    }
    
    return configs;
  }

  // Importer des configurations
  async importConfigs(configs) {
    for (const [key, value] of Object.entries(configs)) {
      if (value !== null) {
        await this.setConfig(key, value);
      }
    }
  }
}

// Singleton
let instance = null;

export function getConfigSync() {
  if (!instance) {
    instance = new ConfigSync();
  }
  return instance;
}

export default getConfigSync;