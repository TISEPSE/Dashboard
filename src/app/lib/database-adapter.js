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
        console.log('🌐 [NETWORK] Connexion rétablie');
        this.isOnline = true;
        this.onOnline();
      });
      
      window.addEventListener('offline', () => {
        console.log('❌ [NETWORK] Connexion perdue - mode hors ligne');
        this.isOnline = false;
        this.onOffline();
      });
    }
  }

  // Callback quand la connexion est rétablie
  async onOnline() {
    if (this.isElectron) {
      console.log('🔄 [SYNC] Tentative de synchronisation après reconnexion...');
      try {
        // Nettoyer le cache pour forcer une nouvelle synchronisation
        this.clearCache();
        
        // Relancer une synchronisation pour la période courante
        const now = new Date();
        const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const oneMonthLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        
        await this.getCalendarEvents(oneMonthAgo.toISOString(), oneMonthLater.toISOString());
        console.log('✅ [SYNC] Synchronisation post-reconnexion réussie');
      } catch (error) {
        console.error('❌ [SYNC] Erreur synchronisation post-reconnexion:', error);
      }
    }
  }

  // Callback quand la connexion est perdue
  onOffline() {
    console.log('📴 [OFFLINE] Mode hors ligne activé - utilisation de SQLite uniquement');
  }

  // Vérifier si une connexion Google est possible
  async canConnectToGoogle() {
    if (!this.isOnline) {
      console.log('📴 [CONNECTIVITY] Mode hors ligne détecté');
      return false;
    }
    
    try {
      // Test de connectivité rapide vers Google
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 secondes timeout pour Electron
      
      console.log('🔍 [CONNECTIVITY] Test de connexion Google Calendar...');
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
        console.log('✅ [CONNECTIVITY] Google Calendar accessible');
        return true;
      } else {
        console.warn(`⚠️ [CONNECTIVITY] Google Calendar inaccessible (${response.status})`);
        return false;
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.warn('⏰ [CONNECTIVITY] Timeout lors du test de connexion Google');
      } else {
        console.warn('⚠️ [CONNECTIVITY] Erreur test connexion Google:', error.message);
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
    console.log('🔑 [ADAPTER] Token d\'accès Google défini:', !!token);
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
      console.error('Erreur récupération préférences navbar:', error);
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
      console.error('Erreur sauvegarde préférences navbar:', error);
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
      console.error('Erreur récupération ordre navbar:', error);
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
      console.error('Erreur sauvegarde ordre navbar:', error);
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
      console.error('Erreur récupération favoris crypto:', error);
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
      console.error('Erreur ajout favori crypto:', error);
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
      console.error('Erreur suppression favori crypto:', error);
      throw error;
    }
  }

  // === MÉTHODES CALENDAR EVENTS ===
  
  async getCalendarEvents(timeMin, timeMax) {
    console.log('🔍 [ADAPTER] getCalendarEvents appelé', { timeMin, timeMax, isElectron: this.isElectron });
    
    const cacheKey = `calendar_events_${timeMin}_${timeMax}`;
    const cached = this.getCached(cacheKey);
    if (cached) {
      console.log('⚡ [ADAPTER] Données en cache utilisées:', cached.length, 'événements');
      return cached;
    }

    try {
      let events;
      
      if (this.isElectron) {
        // Mode Electron - Approche hybride: Google API + SQLite
        console.log('🖥️ [ADAPTER] Mode hybride Electron: Google API + SQLite');
        events = await this.getHybridCalendarEvents(timeMin, timeMax);
      } else {
        // Mode Web - API REST
        const params = new URLSearchParams();
        if (timeMin) params.append('timeMin', timeMin);
        if (timeMax) params.append('timeMax', timeMax);
        
        const url = `/api/calendar/events?${params}`;
        console.log('🌐 [ADAPTER] Appel API:', url);
        
        const response = await fetch(url);
        console.log('📡 [ADAPTER] Réponse API:', { status: response.status, ok: response.ok });
        
        if (!response.ok) throw new Error(`Erreur réseau: ${response.status}`);
        const data = await response.json();
        console.log('📦 [ADAPTER] Données reçues:', data);
        events = data.events || [];
      }
      
      console.log('📅 [ADAPTER] Événements bruts:', events.length);
      
      // Convertir les événements au format attendu
      const formattedEvents = events.map(event => this.formatEvent(event));
      console.log('✨ [ADAPTER] Événements formatés:', formattedEvents.length);
      
      this.setCache(cacheKey, formattedEvents);
      return formattedEvents;
    } catch (error) {
      console.error('❌ [ADAPTER] Erreur récupération événements:', error);
      return [];
    }
  }

  // Méthode hybride pour Electron: Google API + SQLite
  async getHybridCalendarEvents(timeMin, timeMax) {
    console.log('🔄 [HYBRID] Démarrage récupération hybride');
    
    // 1. Toujours récupérer les événements SQLite d'abord (garantie)
    let sqliteEvents = [];
    try {
      const rawEvents = await window.electronAPI.getCalendarEvents(timeMin, timeMax);
      console.log('📊 [HYBRID] Événements SQLite bruts récupérés:', rawEvents?.length || 0);
      console.log('🔍 [HYBRID] Premier événement brut (si existe):', rawEvents?.[0]);
      
      sqliteEvents = rawEvents || [];
    } catch (sqliteError) {
      console.error('❌ [HYBRID] Erreur SQLite:', sqliteError);
      sqliteEvents = [];
    }
    
    // 2. Synchronisation Google en mode Electron (RÉACTIVÉE)
    if (this.isOnline) {
      // Test de connectivité Google avant de tenter la synchronisation
      const canConnectGoogle = await this.canConnectToGoogle();
      
      if (canConnectGoogle) {
        try {
          console.log('🌐 [HYBRID] Tentative de synchronisation Google Calendar...');
          const googleEvents = await this.fetchGoogleCalendarEvents(timeMin, timeMax, this.accessToken);
          
          if (googleEvents && googleEvents.length > 0) {
            console.log('✅ [HYBRID] Événements Google récupérés:', googleEvents.length);
            
            // Synchroniser avec SQLite en arrière-plan
            await this.syncEventsToSQLite(googleEvents, timeMin, timeMax);
            
            // Récupérer les événements mis à jour depuis SQLite
            try {
              const updatedEvents = await window.electronAPI.getCalendarEvents(timeMin, timeMax);
              console.log('📊 [HYBRID] Total événements après sync:', updatedEvents.length);
              return updatedEvents;
            } catch (refreshError) {
              console.warn('⚠️ [HYBRID] Erreur rafraîchissement post-sync, utilisation cache SQLite');
              return sqliteEvents;
            }
          } else {
            console.log('📭 [HYBRID] Aucun événement Google récupéré');
          }
        } catch (googleError) {
          console.warn('⚠️ [HYBRID] Échec récupération Google:', googleError.message);
        }
      } else {
        console.log('🔐 [HYBRID] Google Calendar inaccessible - utilisation SQLite uniquement');
      }
    } else {
      console.log('📴 [HYBRID] Mode hors ligne - utilisation SQLite uniquement');
    }
    
    // 3. Retourner les événements SQLite (avec ou sans sync Google)
    return sqliteEvents;
  }

  // Récupérer les événements depuis Google Calendar API (pour Electron)
  async fetchGoogleCalendarEvents(timeMin, timeMax, accessToken = null) {
    try {
      console.log('🌐 [GOOGLE-API] Tentative de récupération depuis Google...');
      
      // Construire l'URL avec les paramètres
      const params = new URLSearchParams();
      if (timeMin) params.append('timeMin', timeMin);
      if (timeMax) params.append('timeMax', timeMax);
      
      const url = `/api/calendar/google/events?${params}`;
      console.log('🔗 [GOOGLE-API] URL:', url);
      
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
          console.log('🔑 [GOOGLE-API] Utilisation du token d\'accès fourni');
          headers['x-access-token'] = accessToken;
        } else {
          console.warn('⚠️ [GOOGLE-API] Aucun token d\'accès fourni pour Electron');
        }
      }
      
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        signal: controller.signal,
        headers
      });
      
      clearTimeout(timeoutId);
      console.log('📡 [GOOGLE-API] Réponse:', { status: response.status, ok: response.ok });
      
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          console.warn('🔐 [GOOGLE-API] Non authentifié/autorisé, utilisation SQLite uniquement');
          return [];
        }
        if (response.status >= 500) {
          console.warn('🔧 [GOOGLE-API] Erreur serveur, utilisation SQLite uniquement');
          return [];
        }
        throw new Error(`Erreur Google API: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.error || data.needsReauth) {
        console.warn('🔐 [GOOGLE-API] Authentification requise, utilisation SQLite uniquement');
        return [];
      }
      
      const events = data.events || [];
      console.log('✅ [GOOGLE-API] Événements récupérés:', events.length);
      
      // Valider les événements reçus
      const validEvents = events.filter(event => {
        return event && event.id && event.summary && (event.start || event.end);
      });
      
      if (validEvents.length !== events.length) {
        console.warn('⚠️ [GOOGLE-API] Certains événements ignorés (données invalides)');
      }
      
      return validEvents;
    } catch (error) {
      if (error.name === 'AbortError') {
        console.warn('⏰ [GOOGLE-API] Timeout - utilisation SQLite uniquement');
      } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
        console.warn('🔌 [GOOGLE-API] Problème de réseau - utilisation SQLite uniquement');
      } else {
        console.error('❌ [GOOGLE-API] Erreur:', error.message);
      }
      return [];
    }
  }

  // Synchroniser les événements Google avec SQLite
  async syncEventsToSQLite(googleEvents, timeMin, timeMax) {
    if (!googleEvents || googleEvents.length === 0) {
      console.log('📭 [SYNC] Aucun événement Google à synchroniser');
      return { syncedCount: 0, updatedCount: 0 };
    }

    try {
      console.log('🔄 [SYNC] Synchronisation de', googleEvents.length, 'événements vers SQLite (mode batch)');
      
      // Formater les événements pour SQLite
      const formattedEvents = googleEvents.map(event => ({
        ...event,
        googleId: event.id, // Mappage important pour éviter les conflits
        source: 'google'
      }));
      
      // Utiliser la synchronisation en lot pour de meilleures performances
      const result = await window.electronAPI.syncGoogleEvents(formattedEvents);
      
      console.log(`✅ [SYNC] Synchronisation batch terminée:`, result);
      return result;
    } catch (error) {
      console.error('❌ [SYNC] Erreur synchronisation batch, fallback vers sync individuelle:', error);
      
      // Fallback vers la synchronisation individuelle en cas d'erreur
      return await this.syncEventsIndividually(googleEvents, timeMin, timeMax);
    }
  }

  // Méthode de fallback pour synchronisation individuelle
  async syncEventsIndividually(googleEvents, timeMin, timeMax) {
    try {
      console.log('🔄 [SYNC-INDIVIDUAL] Synchronisation individuelle de', googleEvents.length, 'événements');
      
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
          console.error('❌ [SYNC-INDIVIDUAL] Erreur sync événement:', googleEvent.id, eventError);
        }
      }
      
      const result = { syncedCount, updatedCount };
      console.log(`✅ [SYNC-INDIVIDUAL] Synchronisation terminée:`, result);
      return result;
    } catch (error) {
      console.error('❌ [SYNC-INDIVIDUAL] Erreur synchronisation individuelle:', error);
      throw error;
    }
  }

  // Synchroniser un événement local vers Google Calendar
  async syncLocalEventToGoogle(localEvent) {
    try {
      console.log('⬆️ [SYNC-UP] Synchronisation vers Google:', localEvent.id);
      
      // Préparer les données pour Google Calendar
      const googleEventData = {
        summary: localEvent.summary,
        description: localEvent.description || '',
        location: localEvent.location || '',
        start: localEvent.start,
        end: localEvent.end,
        colorId: localEvent.colorId || '1',
        attendees: localEvent.attendees || []
      };
      
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
            console.warn('🔐 [SYNC-UP] Non authentifié pour Google Calendar');
            return null;
          }
          throw new Error(`Erreur mise à jour Google: ${response.status}`);
        }
        
        const updatedEvent = await response.json();
        console.log('✅ [SYNC-UP] Événement mis à jour sur Google:', updatedEvent.id);
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
            console.warn('🔐 [SYNC-UP] Non authentifié pour Google Calendar');
            return null;
          }
          throw new Error(`Erreur création Google: ${response.status}`);
        }
        
        const createdEvent = await response.json();
        console.log('✅ [SYNC-UP] Événement créé sur Google:', createdEvent.id);
        
        // Mettre à jour l'événement local avec le googleId
        await window.electronAPI.updateCalendarEvent(localEvent.id, {
          ...localEvent,
          googleId: createdEvent.id
        });
        
        return createdEvent;
      }
    } catch (error) {
      console.error('❌ [SYNC-UP] Erreur synchronisation vers Google:', error);
      throw error;
    }
  }

  async addCalendarEvent(eventData) {
    try {
      const formattedEvent = this.formatEventForStorage(eventData);
      let result;
      
      if (this.isElectron) {
        // Mode Electron - Ajouter à SQLite d'abord
        result = await window.electronAPI.addCalendarEvent(formattedEvent);
        
        // Synchronisation vers Google Calendar (RÉACTIVÉE)
        if (!formattedEvent.googleId && !formattedEvent.source && this.isOnline) {
          try {
            console.log('🔄 [SYNC-UP] Tentative de synchronisation avec Google Calendar...');
            await this.syncLocalEventToGoogle(result);
            console.log('✅ [SYNC-UP] Synchronisation réussie');
          } catch (syncError) {
            console.warn('⚠️ [SYNC-UP] Synchronisation échouée, événement restera local:', syncError.message);
            // L'événement reste local uniquement - ce n'est pas une erreur critique
          }
        } else if (!this.isOnline) {
          console.log('📴 [SYNC-UP] Mode hors ligne, événement enregistré localement uniquement');
        }
      } else {
        // Mode Web - API REST
        const response = await fetch('/api/calendar/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formattedEvent)
        });
        if (!response.ok) throw new Error('Erreur réseau');
        result = await response.json();
      }
      
      this.clearCache('calendar_events');
      return this.formatEvent(result);
    } catch (error) {
      console.error('Erreur ajout événement:', error);
      throw error;
    }
  }

  async updateCalendarEvent(id, eventData) {
    try {
      const formattedEvent = this.formatEventForStorage(eventData);
      console.log('DatabaseAdapter - updateCalendarEvent - ID:', id);
      console.log('DatabaseAdapter - updateCalendarEvent - Data:', formattedEvent);
      
      let result;
      
      if (this.isElectron) {
        // Mode Electron - Mettre à jour SQLite d'abord
        result = await window.electronAPI.updateCalendarEvent(id, formattedEvent);
        
        // Si l'événement a un googleId, synchroniser les changements avec Google
        if (formattedEvent.googleId) {
          try {
            await this.syncLocalEventToGoogle({ ...formattedEvent, id });
          } catch (syncError) {
            console.warn('⚠️ [SYNC-UP] Impossible de synchroniser la mise à jour avec Google:', syncError.message);
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
          console.error('Erreur API updateCalendarEvent:', response.status, errorText);
          throw new Error(`Erreur réseau: ${response.status}`);
        }
        result = await response.json();
      }
      
      this.clearCache('calendar_events');
      return result;
    } catch (error) {
      console.error('Erreur mise à jour événement:', error);
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
            console.warn('⚠️ [SYNC-DELETE] Impossible de supprimer de Google Calendar:', syncError.message);
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
      console.error('Erreur suppression événement:', error);
      throw error;
    }
  }

  // Supprimer un événement de Google Calendar
  async deleteGoogleEvent(googleId) {
    try {
      console.log('🗑️ [SYNC-DELETE] Suppression de Google Calendar:', googleId);
      
      const response = await fetch(`/api/calendar/google/events/${googleId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          console.warn('🔐 [SYNC-DELETE] Non authentifié pour Google Calendar');
          return null;
        }
        if (response.status === 404) {
          console.warn('⚠️ [SYNC-DELETE] Événement déjà supprimé de Google Calendar');
          return null;
        }
        throw new Error(`Erreur suppression Google: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('✅ [SYNC-DELETE] Événement supprimé de Google Calendar:', googleId);
      return result;
    } catch (error) {
      console.error('❌ [SYNC-DELETE] Erreur suppression Google Calendar:', error);
      throw error;
    }
  }

  // === MÉTHODES UTILITAIRES ===
  
  formatEvent(event) {
    // Convertir l'événement vers le format Google Calendar standard
    if (!event) {
      console.warn('⚠️ [FORMAT] Événement null reçu');
      return null;
    }
    
    console.log('🔍 [FORMAT] Formatage événement:', event);
    
    // Si l'événement a déjà le bon format (depuis API), le retourner tel quel
    if (event.start && (event.start.dateTime || event.start.date)) {
      console.log('✅ [FORMAT] Événement déjà au bon format (API)');
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
    console.log('🔄 [FORMAT] Conversion depuis format SQLite');
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
      console.error('❌ [FORMAT] Événement sans date de début valide:', event);
      return null;
    }
    
    console.log('✅ [FORMAT] Événement formaté:', formatted);
    return formatted;
  }

  formatEventForStorage(event) {
    // Convertir l'événement du format Google Calendar vers SQLite
    return {
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
      console.log('🔍 [LOCAL-STORAGE] Récupération des préférences navbar...');
      const encrypted = localStorage.getItem('dashboard_navbar_preferences');
      if (!encrypted) {
        console.log('📭 [LOCAL-STORAGE] Aucune préférence navbar trouvée, utilisation des valeurs par défaut');
        return this.getDefaultNavbarPreferences();
      }
      const preferences = this.decryptData(encrypted);
      console.log('✅ [LOCAL-STORAGE] Préférences navbar récupérées:', preferences);
      return { ...this.getDefaultNavbarPreferences(), ...preferences };
    } catch (error) {
      console.error('❌ [LOCAL-STORAGE] Erreur récupération préférences navbar:', error);
      return this.getDefaultNavbarPreferences();
    }
  }

  // Sauvegarder les préférences navbar locales
  saveLocalNavbarPreferences(preferences) {
    try {
      const encrypted = this.encryptData(preferences);
      localStorage.setItem('dashboard_navbar_preferences', encrypted);
      console.log('✅ [LOCAL-STORAGE] Préférences navbar sauvegardées:', preferences);
      return { success: true };
    } catch (error) {
      console.error('❌ [LOCAL-STORAGE] Erreur sauvegarde préférences navbar:', error);
      throw error;
    }
  }

  // Récupérer l'ordre navbar local
  getLocalNavbarOrder() {
    try {
      console.log('🔍 [LOCAL-STORAGE] Récupération de l\'ordre navbar...');
      const encrypted = localStorage.getItem('dashboard_navbar_order');
      if (!encrypted) {
        console.log('📭 [LOCAL-STORAGE] Aucun ordre navbar trouvé, utilisation des valeurs par défaut');
        return this.getDefaultNavbarOrder();
      }
      const order = this.decryptData(encrypted);
      console.log('✅ [LOCAL-STORAGE] Ordre navbar récupéré:', order);
      return order;
    } catch (error) {
      console.error('❌ [LOCAL-STORAGE] Erreur récupération ordre navbar:', error);
      return this.getDefaultNavbarOrder();
    }
  }

  // Sauvegarder l'ordre navbar local
  saveLocalNavbarOrder(order) {
    try {
      const encrypted = this.encryptData(order);
      localStorage.setItem('dashboard_navbar_order', encrypted);
      console.log('✅ [LOCAL-STORAGE] Ordre navbar sauvegardé:', order);
      return { success: true };
    } catch (error) {
      console.error('❌ [LOCAL-STORAGE] Erreur sauvegarde ordre navbar:', error);
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
      console.error('Erreur chiffrement:', error);
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
      console.error('Erreur déchiffrement:', error);
      return [];
    }
  }

  // Récupérer les favoris crypto locaux
  getLocalCryptoFavorites() {
    try {
      console.log('🔍 [LOCAL-STORAGE] Récupération des favoris...');
      const encrypted = localStorage.getItem('dashboard_crypto_favorites');
      if (!encrypted) {
        console.log('📭 [LOCAL-STORAGE] Aucun favori trouvé');
        return [];
      }
      const favorites = this.decryptData(encrypted);
      console.log('✅ [LOCAL-STORAGE] Favoris récupérés:', favorites);
      return favorites;
    } catch (error) {
      console.error('❌ [LOCAL-STORAGE] Erreur récupération favoris locaux:', error);
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
      
      console.log('✅ [LOCAL-STORAGE] Favori ajouté:', newFavorite);
      return { success: true, favorite: newFavorite };
    } catch (error) {
      console.error('❌ [LOCAL-STORAGE] Erreur ajout favori:', error);
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
      
      console.log('✅ [LOCAL-STORAGE] Favori supprimé:', symbol);
      return { success: true, removedSymbol: symbol };
    } catch (error) {
      console.error('❌ [LOCAL-STORAGE] Erreur suppression favori:', error);
      throw error;
    }
  }

  // Méthodes de synchronisation
  async syncWithGoogle() {
    if (this.isElectron) {
      console.log('Synchronisation Google non disponible en mode Electron - utilisez le mode web');
      return;
    }
    
    try {
      console.log('🔄 Démarrage synchronisation Google Calendar...');
      
      // En mode web, forcer un rechargement des événements Google
      this.clearCache('calendar_events');
      
      // Déclencher un nouvel appel API qui inclura les événements Google
      const now = new Date();
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const oneMonthLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      
      // Forcer le rechargement des événements pour la période courante
      await this.getCalendarEvents(oneMonthAgo.toISOString(), oneMonthLater.toISOString());
      
      console.log('✅ Synchronisation Google Calendar terminée');
    } catch (error) {
      console.error('❌ Erreur synchronisation Google:', error);
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