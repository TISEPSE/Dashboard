// Adaptateur pour gérer les bases de données selon le contexte (web/electron)

class DatabaseAdapter {
  constructor() {
    this.isElectron = typeof window !== 'undefined' && window.electronAPI;
    this.cache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
    this.isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    this.accessToken = null; // Token d'accès Google pour Electron
    this.setupOfflineDetection();
  }

  // Configuration de la détection hors ligne
  setupOfflineDetection() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.isOnline = true;
        this.onOnline();
      });
      
      window.addEventListener('offline', () => {
        this.isOnline = false;
        this.onOffline();
      });
    }
  }

  // Callback quand la connexion est rétablie
  async onOnline() {
    if (this.isElectron) {
      try {
        // Nettoyer le cache pour forcer une nouvelle synchronisation
        this.clearCache();
        
        // Relancer une synchronisation pour la période courante
        const now = new Date();
        const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const oneMonthLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        
        await this.getCalendarEvents(oneMonthAgo.toISOString(), oneMonthLater.toISOString());
      } catch (error) {
        // Erreur synchronisation post-reconnexion silencieuse
      }
    }
  }

  // Callback quand la connexion est perdue
  onOffline() {
    // Mode hors ligne activé - utilisation de SQLite uniquement
  }

  // Vérifier si une connexion Google est possible
  async canConnectToGoogle() {
    if (!this.isOnline) {
      // Log supprimé pour performance
      return false;
    }
    
    try {
      // Test de connectivité rapide vers Google
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 secondes timeout pour Electron
      
      // Log supprimé pour performance
      const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
      
      // En mode Electron, ajouter un header spécial pour identification
      if (this.isElectron) {
        headers['x-electron-app'] = 'true'
        headers['User-Agent'] = 'Dashboard-Electron/1.0'
      }
      
      const response = await fetch('/api/calendar/google/ping', {
        method: 'GET',
        credentials: 'include',
        signal: controller.signal,
        headers
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        // Log supprimé pour performance
        return true;
      } else {
        // Log supprimé pour performance
        return false;
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        // Log supprimé pour performance
      } else {
        // Log supprimé pour performance
      }
      return false;
    }
  }

  // === DÉTECTION DE CONTEXTE ===
  
  isElectronApp() {
    return this.isElectron;
  }

  // Définir le token d'accès Google pour Electron
  setAccessToken(token) {
    this.accessToken = token;
  }

  // === MÉTHODES CACHE ===
  
  getCached(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  clearCache(pattern = null) {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  // === MÉTHODES NAVBAR PREFERENCES ===
  
  async getNavbarPreferences() {
    const cacheKey = 'navbar_preferences';
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    try {
      let preferences;
      
      if (this.isElectron) {
        // Mode Electron - SQLite local chiffré
        preferences = await window.electronAPI.getNavbarPreferences();
      } else {
        // Mode Web - Stockage local chiffré
        preferences = this.getLocalNavbarPreferences();
      }
      
      this.setCache(cacheKey, preferences);
      return preferences;
    } catch (error) {
      // Log supprimé pour performance
      return this.getDefaultNavbarPreferences();
    }
  }

  async saveNavbarPreferences(preferences) {
    try {
      let result;
      
      if (this.isElectron) {
        // Mode Electron - SQLite local chiffré
        result = await window.electronAPI.saveNavbarPreferences(preferences);
      } else {
        // Mode Web - Stockage local chiffré
        result = this.saveLocalNavbarPreferences(preferences);
      }
      
      this.clearCache('navbar_preferences');
      return result;
    } catch (error) {
      // Log supprimé pour performance
      throw error;
    }
  }

  async getNavbarOrder() {
    const cacheKey = 'navbar_order';
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    try {
      let order;
      
      if (this.isElectron) {
        // Mode Electron - SQLite local chiffré
        order = await window.electronAPI.getNavbarOrder();
      } else {
        // Mode Web - Stockage local chiffré
        order = this.getLocalNavbarOrder();
      }
      
      this.setCache(cacheKey, order);
      return order;
    } catch (error) {
      // Log supprimé pour performance
      return this.getDefaultNavbarOrder();
    }
  }

  async saveNavbarOrder(order) {
    try {
      let result;
      
      if (this.isElectron) {
        // Mode Electron - SQLite local chiffré
        result = await window.electronAPI.saveNavbarOrder(order);
      } else {
        // Mode Web - Stockage local chiffré
        result = this.saveLocalNavbarOrder(order);
      }
      
      this.clearCache('navbar_order');
      return result;
    } catch (error) {
      // Log supprimé pour performance
      throw error;
    }
  }

  // === MÉTHODES CRYPTO FAVORITES ===
  
  async getCryptoFavorites() {
    const cacheKey = 'crypto_favorites';
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    try {
      let favorites;
      
      if (this.isElectron) {
        // Mode Electron - SQLite local chiffré
        favorites = await window.electronAPI.getCryptoFavorites();
      } else {
        // Mode Web - Stockage local chiffré
        favorites = this.getLocalCryptoFavorites();
      }
      
      this.setCache(cacheKey, favorites);
      return favorites;
    } catch (error) {
      // Log supprimé pour performance
      return [];
    }
  }

  async addCryptoFavorite(crypto) {
    try {
      let result;
      
      if (this.isElectron) {
        // Mode Electron - SQLite local chiffré
        result = await window.electronAPI.addCryptoFavorite(crypto);
      } else {
        // Mode Web - Stockage local chiffré
        result = this.addLocalCryptoFavorite(crypto);
      }
      
      this.clearCache('crypto_favorites');
      return result;
    } catch (error) {
      // Log supprimé pour performance
      throw error;
    }
  }

  async removeCryptoFavorite(symbol) {
    try {
      let result;
      
      if (this.isElectron) {
        // Mode Electron - SQLite local chiffré
        const removed = await window.electronAPI.removeCryptoFavorite(symbol);
        result = { success: removed, removedSymbol: symbol };
      } else {
        // Mode Web - Stockage local chiffré
        result = this.removeLocalCryptoFavorite(symbol);
      }
      
      this.clearCache('crypto_favorites');
      return result;
    } catch (error) {
      // Log supprimé pour performance
      throw error;
    }
  }

  // === MÉTHODES CALENDAR EVENTS ===
  
  async getCalendarEvents(timeMin, timeMax) {
    
    const cacheKey = `calendar_events_${timeMin}_${timeMax}`;
    const cached = this.getCached(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      let events;
      
      if (this.isElectron) {
        // Mode Electron - Approche hybride: Google API + SQLite
        events = await this.getHybridCalendarEvents(timeMin, timeMax);
      } else {
        // Mode Web - API REST
        const params = new URLSearchParams();
        if (timeMin) params.append('timeMin', timeMin);
        if (timeMax) params.append('timeMax', timeMax);
        
        const url = `/api/calendar/events?${params}`;
        
        const response = await fetch(url);
        
        if (!response.ok) throw new Error(`Erreur réseau: ${response.status}`);
        const data = await response.json();
        events = data.events || [];
      }
      
      
      // Convertir les événements au format attendu et filtrer les nulls
      const formattedEvents = events
        .filter(event => event && typeof event === 'object' && Object.keys(event).length > 0)
        .map(event => this.formatEvent(event))
        .filter(event => event !== null);
      
      this.setCache(cacheKey, formattedEvents);
      return formattedEvents;
    } catch (error) {
      // Log supprimé pour performance
      return [];
    }
  }

  // Méthode hybride pour Electron: Google API + SQLite
  async getHybridCalendarEvents(timeMin, timeMax) {
    // Log supprimé pour performance
    
    // 1. Toujours récupérer les événements SQLite d'abord (garantie)
    let sqliteEvents = [];
    try {
      const rawEvents = await window.electronAPI.getCalendarEvents(timeMin, timeMax);
      // Log supprimé pour performance
      
      sqliteEvents = rawEvents || [];
    } catch (sqliteError) {
      // Log supprimé pour performance
      sqliteEvents = [];
    }
    
    // 2. Synchronisation Google en mode Electron (RÉACTIVÉE)
    if (this.isOnline) {
      // Test de connectivité Google avant de tenter la synchronisation
      const canConnectGoogle = await this.canConnectToGoogle();
      
      if (canConnectGoogle) {
        try {
          // Log supprimé pour performance
          const googleEvents = await this.fetchGoogleCalendarEvents(timeMin, timeMax, this.accessToken);
          
          if (googleEvents && googleEvents.length > 0) {
            // Log supprimé pour performance
            
            // Synchroniser avec SQLite en arrière-plan
            await this.syncEventsToSQLite(googleEvents, timeMin, timeMax);
            
            // Récupérer les événements mis à jour depuis SQLite
            try {
              const updatedEvents = await window.electronAPI.getCalendarEvents(timeMin, timeMax);
              // Log supprimé pour performance
              return updatedEvents;
            } catch (refreshError) {
              // Log supprimé pour performance
              return sqliteEvents;
            }
          } else {
            // Log supprimé pour performance
          }
        } catch (googleError) {
          // Log supprimé pour performance
        }
      } else {
        // Log supprimé pour performance
      }
    } else {
      // Log supprimé pour performance
    }
    
    // 3. Retourner les événements SQLite (avec ou sans sync Google)
    return sqliteEvents;
  }

  // Récupérer les événements depuis Google Calendar API (pour Electron)
  async fetchGoogleCalendarEvents(timeMin, timeMax, accessToken = null) {
    try {
      // Log supprimé pour performance
      
      // Construire l'URL avec les paramètres
      const params = new URLSearchParams();
      if (timeMin) params.append('timeMin', timeMin);
      if (timeMax) params.append('timeMax', timeMax);
      
      const url = `/api/calendar/google/events?${params}`;
      // Log supprimé pour performance
      
      // Timeout étendu pour permettre l'authentification Google en Electron
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 secondes
      
      const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
      
      // En mode Electron, ajouter un header spécial pour identification
      if (this.isElectron) {
        headers['x-electron-app'] = 'true'
        headers['User-Agent'] = 'Dashboard-Electron/1.0'
        
        // En mode Electron, utiliser le token fourni en paramètre
        if (accessToken) {
          // Log supprimé pour performance
          headers['x-access-token'] = accessToken;
        } else {
          // Log supprimé pour performance
        }
      }
      
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        signal: controller.signal,
        headers
      });
      
      clearTimeout(timeoutId);
      // Log supprimé pour performance
      
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          // Log supprimé pour performance
          return [];
        }
        if (response.status >= 500) {
          // Log supprimé pour performance
          return [];
        }
        throw new Error(`Erreur Google API: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.error || data.needsReauth) {
        // Log supprimé pour performance
        return [];
      }
      
      const events = data.events || [];
      // Log supprimé pour performance
      
      // Valider les événements reçus
      const validEvents = events.filter(event => {
        return event && event.id && event.summary && (event.start || event.end);
      });
      
      if (validEvents.length !== events.length) {
        // Log supprimé pour performance
      }
      
      return validEvents;
    } catch (error) {
      if (error.name === 'AbortError') {
        // Log supprimé pour performance
      } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
        // Log supprimé pour performance
      } else {
        // Log supprimé pour performance
      }
      return [];
    }
  }

  // Synchroniser les événements Google avec SQLite
  async syncEventsToSQLite(googleEvents, timeMin, timeMax) {
    if (!googleEvents || googleEvents.length === 0) {
      // Log supprimé pour performance
      return { syncedCount: 0, updatedCount: 0 };
    }

    try {
      // Log supprimé pour performance
      
      // Formater les événements pour SQLite
      const formattedEvents = googleEvents.map(event => ({
        ...event,
        googleId: event.id, // Mappage important pour éviter les conflits
        source: 'google'
      }));
      
      // Utiliser la synchronisation en lot pour de meilleures performances
      const result = await window.electronAPI.syncGoogleEvents(formattedEvents);
      
      // Log supprimé pour performance
      return result;
    } catch (error) {
      // Log supprimé pour performance
      
      // Fallback vers la synchronisation individuelle en cas d'erreur
      return await this.syncEventsIndividually(googleEvents, timeMin, timeMax);
    }
  }

  // Méthode de fallback pour synchronisation individuelle
  async syncEventsIndividually(googleEvents, timeMin, timeMax) {
    try {
      // Log supprimé pour performance
      
      let syncedCount = 0;
      let updatedCount = 0;
      
      for (const googleEvent of googleEvents) {
        try {
          await window.electronAPI.addCalendarEvent({
            ...googleEvent,
            googleId: googleEvent.id,
            source: 'google'
          });
          syncedCount++;
        } catch (eventError) {
          // Log supprimé pour performance
        }
      }
      
      const result = { syncedCount, updatedCount };
      // Log supprimé pour performance
      return result;
    } catch (error) {
      // Log supprimé pour performance
      throw error;
    }
  }

  // Synchroniser un événement local vers Google Calendar (version bloquante)
  async syncLocalEventToGoogle(localEvent) {
    try {
      // Log supprimé pour performance
      
      // Préparer les données pour Google Calendar avec format correct
      const googleEventData = {
        summary: localEvent.summary,
        description: localEvent.description || '',
        location: localEvent.location || '',
        start: {
          dateTime: typeof localEvent.start === 'string' ? localEvent.start : localEvent.start?.dateTime,
          timeZone: 'Europe/Paris'
        },
        end: {
          dateTime: typeof localEvent.end === 'string' ? localEvent.end : localEvent.end?.dateTime,
          timeZone: 'Europe/Paris'
        },
        colorId: localEvent.colorId || '1',
        attendees: localEvent.attendees || []
      };
      
      // Log supprimé pour performance
      
      if (localEvent.googleId) {
        // Mettre à jour un événement existant
        const headers = { 'Content-Type': 'application/json' }
        if (this.isElectron) {
          headers['x-electron-app'] = 'true'
          headers['User-Agent'] = 'Dashboard-Electron/1.0'
        }
        
        const response = await fetch(`/api/calendar/google/events/${localEvent.googleId}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(googleEventData),
          credentials: 'include'
        });
        
        if (!response.ok) {
          if (response.status === 401) {
            // Log supprimé pour performance
            return null;
          }
          throw new Error(`Erreur mise à jour Google: ${response.status}`);
        }
        
        const responseData = await response.json();
        const updatedEvent = responseData.event || responseData; // Handle both formats
        // Log supprimé pour performance
        return updatedEvent;
      } else {
        // Créer un nouvel événement
        const headers = { 'Content-Type': 'application/json' }
        if (this.isElectron) {
          headers['x-electron-app'] = 'true'
          headers['User-Agent'] = 'Dashboard-Electron/1.0'
        }
        
        const response = await fetch('/api/calendar/google/create', {
          method: 'POST',
          headers,
          body: JSON.stringify(googleEventData),
          credentials: 'include'
        });
        
        if (!response.ok) {
          if (response.status === 401) {
            // Log supprimé pour performance
            return null;
          }
          throw new Error(`Erreur création Google: ${response.status}`);
        }
        
        const responseData = await response.json();
        const createdEvent = responseData.event || responseData; // Handle both formats
        // Log supprimé pour performance
        
        // Mettre à jour l'événement local avec le googleId
        await window.electronAPI.updateCalendarEvent(localEvent.id, {
          ...localEvent,
          googleId: createdEvent.id
        });
        
        return createdEvent;
      }
    } catch (error) {
      // Log supprimé pour performance
      throw error;
    }
  }

  // Synchroniser un événement local vers Google Calendar (version arrière-plan)
  async syncLocalEventToGoogleBackground(localEvent) {
    try {
      // Log supprimé pour performance
      
      // Attendre un court instant pour laisser l'UI se mettre à jour
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const createdEvent = await this.syncLocalEventToGoogle(localEvent);
      
      if (createdEvent) {
        // Log supprimé pour performance
        // Optionnel : émettre un événement pour notifier l'UI
        if (typeof window !== 'undefined' && window.dispatchEvent) {
          window.dispatchEvent(new CustomEvent('googleSyncSuccess', { 
            detail: { localEventId: localEvent.id, googleEvent: createdEvent }
          }));
        }
      }
      
      return createdEvent;
    } catch (error) {
      // Log supprimé pour performance
      
      // Optionnel : émettre un événement d'erreur
      if (typeof window !== 'undefined' && window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('googleSyncError', { 
          detail: { localEventId: localEvent.id, error: error.message }
        }));
      }
      
      throw error;
    }
  }

  async addCalendarEvent(eventData) {
    try {
      const formattedEvent = this.formatEventForStorage(eventData);
      // Log supprimé pour performance
      let result;
      
      if (this.isElectron) {
        // Mode Electron - Ajouter à SQLite d'abord
        result = await window.electronAPI.addCalendarEvent(formattedEvent);
        // Log supprimé pour performance
        
        // Nettoyer le cache pour forcer le rafraîchissement
        this.clearCache('calendar_events');
        
        // Synchronisation vers Google Calendar en arrière-plan (NON BLOQUANTE)
        if (!formattedEvent.googleId && !formattedEvent.source && this.isOnline) {
          // Lancer la synchronisation en arrière-plan sans attendre
          this.syncLocalEventToGoogleBackground(result).catch(syncError => {
            console.warn('⚠️ [SYNC-BACKGROUND] Synchronisation échouée, événement restera local:', syncError.message);
          });
          // Log supprimé pour performance
        } else if (!this.isOnline) {
          // Log supprimé pour performance
        }
      } else {
        // Mode Web - API REST SIMPLIFIÉ
        // Log supprimé pour performance
        
        const response = await fetch('/api/calendar/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formattedEvent)
        });
        
        if (!response.ok) {
          throw new Error(`Erreur API: ${response.status}`);
        }
        
        result = await response.json();
        // Log supprimé pour performance
        
        // Nettoyer le cache pour forcer le rafraîchissement
        this.clearCache('calendar_events');
      }
      
      // SIMPLIFICATION TOTALE - Juste retourner l'événement
      // Log supprimé pour performance
      return result;
    } catch (error) {
      // Log supprimé pour performance
      throw error;
    }
  }

  async updateCalendarEvent(id, eventData) {
    try {
      const formattedEvent = this.formatEventForStorage(eventData);
      // Log supprimé pour performance
      
      let result;
      
      if (this.isElectron) {
        // Mode Electron - Mettre à jour SQLite d'abord
        result = await window.electronAPI.updateCalendarEvent(id, formattedEvent);
        
        // Si l'événement a un googleId, synchroniser les changements avec Google
        if (formattedEvent.googleId) {
          try {
            await this.syncLocalEventToGoogle({ ...formattedEvent, id });
          } catch (syncError) {
            // Log supprimé pour performance
            // La mise à jour reste locale uniquement
          }
        }
      } else {
        // Mode Web - API REST
        const response = await fetch(`/api/calendar/events/${encodeURIComponent(id)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formattedEvent)
        });
        if (!response.ok) {
          const errorText = await response.text();
          // Log supprimé pour performance
          throw new Error(`Erreur réseau: ${response.status}`);
        }
        const responseData = await response.json();
        
        // L'API REST retourne { event: {...}, message: "..." }
        result = responseData.event || responseData;
      }
      
      this.clearCache('calendar_events');
      return result;
    } catch (error) {
      // Log supprimé pour performance
      throw error;
    }
  }

  async deleteCalendarEvent(id) {
    try {
      let result;
      
      if (this.isElectron) {
        // Mode Electron - Récupérer l'événement d'abord pour vérifier s'il a un googleId
        const events = await window.electronAPI.getCalendarEvents();
        const eventToDelete = events.find(event => event.id === id);
        
        // Supprimer de SQLite
        result = await window.electronAPI.deleteCalendarEvent(id);
        
        // Si l'événement avait un googleId, le supprimer aussi de Google Calendar
        if (eventToDelete?.google_id) {
          try {
            await this.deleteGoogleEvent(eventToDelete.google_id);
          } catch (syncError) {
            // Log supprimé pour performance
            // La suppression reste locale uniquement
          }
        }
      } else {
        // Mode Web - API REST
        const response = await fetch(`/api/calendar/events/${id}`, {
          method: 'DELETE'
        });
        if (!response.ok) throw new Error('Erreur réseau');
        result = await response.json();
      }
      
      this.clearCache('calendar_events');
      return result;
    } catch (error) {
      // Log supprimé pour performance
      throw error;
    }
  }

  // Supprimer un événement de Google Calendar
  async deleteGoogleEvent(googleId) {
    try {
      // Log supprimé pour performance
      
      const response = await fetch(`/api/calendar/google/events/${googleId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          // Log supprimé pour performance
          return null;
        }
        if (response.status === 404) {
          // Log supprimé pour performance
          return null;
        }
        throw new Error(`Erreur suppression Google: ${response.status}`);
      }
      
      const result = await response.json();
      // Log supprimé pour performance
      return result;
    } catch (error) {
      // Log supprimé pour performance
      throw error;
    }
  }

  // === MÉTHODES UTILITAIRES ===
  
  formatEvent(event) {
    // Convertir l'événement vers le format Google Calendar standard
    if (!event) {
      // Log supprimé pour performance
      return null;
    }
    
    // Vérifier si l'événement est vide
    if (typeof event === 'object' && Object.keys(event).length === 0) {
      // Log supprimé pour performance
      
      // Retourner null au lieu de continuer le formatage
      return null;
    }
    
    
    // Si l'événement a déjà le bon format (depuis API), le retourner tel quel
    if (event.start && (event.start.dateTime || event.start.date)) {
      return {
        id: event.id,
        googleId: event.googleId,
        summary: event.summary,
        description: event.description || '',
        location: event.location || '',
        colorId: event.colorId || event.color_id || '1',
        start: event.start,
        end: event.end,
        attendees: event.attendees || [],
        created: event.created,
        updated: event.updated,
        source: event.source || 'local'
      };
    }
    
    // Sinon, convertir depuis le format SQLite
    const formatted = {
      id: event.id,
      summary: event.summary,
      description: event.description || '',
      location: event.location || '',
      colorId: event.color_id || '1',
      start: {
        dateTime: event.start_datetime || undefined,
        date: event.start_date || undefined
      },
      end: {
        dateTime: event.end_datetime || undefined,
        date: event.end_date || undefined
      },
      attendees: event.attendees ? (typeof event.attendees === 'string' ? JSON.parse(event.attendees) : event.attendees) : [],
      created: event.created_at,
      updated: event.updated_at,
      source: 'local'
    };
    
    // Validation que l'événement formaté a les champs requis
    if (!formatted.start.dateTime && !formatted.start.date) {
      // Log supprimé pour performance
      return null;
    }
    
    return formatted;
  }

  formatEventForStorage(event) {
    // Convertir l'événement vers le format SQLite
    // Log supprimé pour performance
    
    const formatted = {
      id: event.id,
      googleId: event.googleId,
      summary: event.summary,
      description: event.description,
      location: event.location,
      colorId: event.colorId || '1',
      start: event.start,
      end: event.end,
      attendees: event.attendees,
      userId: event.userId
    };
    
    // Log supprimé pour performance
    return formatted;
  }

  // === MÉTHODES STOCKAGE LOCAL CHIFFRÉ (MODE WEB) ===

  // === MÉTHODES NAVBAR LOCALES ===

  getDefaultNavbarPreferences() {
    return {
      home: true,
      crypto: true,
      message: true,
      meteo: true,
      sante: true,
      finances: true,
      calendrier: true,
      profile: true,
      parametres: true
    };
  }

  getDefaultNavbarOrder() {
    return [
      'home',
      'crypto', 
      'message',
      'meteo',
      'sante',
      'finances',
      'calendrier'
    ];
  }

  // Récupérer les préférences navbar locales
  getLocalNavbarPreferences() {
    try {
      const encrypted = localStorage.getItem('dashboard_navbar_preferences');
      if (!encrypted) {
        return this.getDefaultNavbarPreferences();
      }
      const preferences = this.decryptData(encrypted);
      // Log supprimé pour performance
      return { ...this.getDefaultNavbarPreferences(), ...preferences };
    } catch (error) {
      // Log supprimé pour performance
      return this.getDefaultNavbarPreferences();
    }
  }

  // Sauvegarder les préférences navbar locales
  saveLocalNavbarPreferences(preferences) {
    try {
      const encrypted = this.encryptData(preferences);
      localStorage.setItem('dashboard_navbar_preferences', encrypted);
      // Log supprimé pour performance
      return { success: true };
    } catch (error) {
      // Log supprimé pour performance
      throw error;
    }
  }

  // Récupérer l'ordre navbar local
  getLocalNavbarOrder() {
    try {
      // Log supprimé pour performance
      const encrypted = localStorage.getItem('dashboard_navbar_order');
      if (!encrypted) {
        // Log supprimé pour performance
        return this.getDefaultNavbarOrder();
      }
      const order = this.decryptData(encrypted);
      // Log supprimé pour performance
      return order;
    } catch (error) {
      // Log supprimé pour performance
      return this.getDefaultNavbarOrder();
    }
  }

  // Sauvegarder l'ordre navbar local
  saveLocalNavbarOrder(order) {
    try {
      const encrypted = this.encryptData(order);
      localStorage.setItem('dashboard_navbar_order', encrypted);
      // Log supprimé pour performance
      return { success: true };
    } catch (error) {
      // Log supprimé pour performance
      throw error;
    }
  }
  
  // Clé de chiffrement pour le stockage local
  getEncryptionKey() {
    let key = localStorage.getItem('dashboard_crypto_key');
    if (!key) {
      // Générer une nouvelle clé unique pour cet utilisateur/navigateur
      key = Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      localStorage.setItem('dashboard_crypto_key', key);
    }
    return key;
  }

  // Chiffrer les données
  encryptData(data) {
    try {
      const key = this.getEncryptionKey();
      const jsonString = JSON.stringify(data);
      // Simple XOR encryption pour la démo (en production, utiliser crypto-js)
      let encrypted = '';
      for (let i = 0; i < jsonString.length; i++) {
        encrypted += String.fromCharCode(jsonString.charCodeAt(i) ^ key.charCodeAt(i % key.length));
      }
      return btoa(encrypted);
    } catch (error) {
      // Log supprimé pour performance
      return btoa(JSON.stringify(data));
    }
  }

  // Déchiffrer les données
  decryptData(encryptedData) {
    try {
      const key = this.getEncryptionKey();
      const encrypted = atob(encryptedData);
      let decrypted = '';
      for (let i = 0; i < encrypted.length; i++) {
        decrypted += String.fromCharCode(encrypted.charCodeAt(i) ^ key.charCodeAt(i % key.length));
      }
      return JSON.parse(decrypted);
    } catch (error) {
      // Log supprimé pour performance
      return [];
    }
  }

  // Récupérer les favoris crypto locaux
  getLocalCryptoFavorites() {
    try {
      // Log supprimé pour performance
      const encrypted = localStorage.getItem('dashboard_crypto_favorites');
      if (!encrypted) {
        // Log supprimé pour performance
        return [];
      }
      const favorites = this.decryptData(encrypted);
      // Log supprimé pour performance
      return favorites;
    } catch (error) {
      // Log supprimé pour performance
      return [];
    }
  }

  // Ajouter un favori crypto local
  addLocalCryptoFavorite(crypto) {
    try {
      const favorites = this.getLocalCryptoFavorites();
      
      // Vérifier si déjà présent
      const exists = favorites.find(fav => fav.symbol.toLowerCase() === crypto.symbol.toLowerCase());
      if (exists) {
        throw new Error('Ce crypto est déjà dans vos favoris');
      }

      // Ajouter le nouveau favori
      const newFavorite = {
        symbol: crypto.symbol.toLowerCase(),
        name: crypto.name,
        addedAt: new Date().toISOString()
      };
      
      favorites.push(newFavorite);
      
      // Sauvegarder chiffré
      const encrypted = this.encryptData(favorites);
      localStorage.setItem('dashboard_crypto_favorites', encrypted);
      
      // Log supprimé pour performance
      return { success: true, favorite: newFavorite };
    } catch (error) {
      // Log supprimé pour performance
      throw error;
    }
  }

  // Supprimer un favori crypto local
  removeLocalCryptoFavorite(symbol) {
    try {
      const favorites = this.getLocalCryptoFavorites();
      const initialLength = favorites.length;
      
      // Filtrer pour supprimer
      const updatedFavorites = favorites.filter(fav => 
        fav.symbol.toLowerCase() !== symbol.toLowerCase()
      );
      
      if (updatedFavorites.length === initialLength) {
        throw new Error('Favori non trouvé');
      }

      // Sauvegarder chiffré
      const encrypted = this.encryptData(updatedFavorites);
      localStorage.setItem('dashboard_crypto_favorites', encrypted);
      
      // Log supprimé pour performance
      return { success: true, removedSymbol: symbol };
    } catch (error) {
      // Log supprimé pour performance
      throw error;
    }
  }

  // Méthodes de synchronisation
  async syncWithGoogle() {
    if (this.isElectron) {
      // Log supprimé pour performance
      return;
    }
    
    try {
      // Log supprimé pour performance
      
      // En mode web, forcer un rechargement des événements Google
      this.clearCache('calendar_events');
      
      // Déclencher un nouvel appel API qui inclura les événements Google
      const now = new Date();
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const oneMonthLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      
      // Forcer le rechargement des événements pour la période courante
      await this.getCalendarEvents(oneMonthAgo.toISOString(), oneMonthLater.toISOString());
      
      // Log supprimé pour performance
    } catch (error) {
      // Log supprimé pour performance
      throw error;
    }
  }
}

// Singleton
let instance = null;

export function getDatabaseAdapter() {
  if (!instance) {
    instance = new DatabaseAdapter();
  }
  return instance;
}

export default getDatabaseAdapter;