// Adaptateur pour gérer les bases de données selon le contexte (web/electron)

class DatabaseAdapter {
  constructor() {
    this.isElectron = typeof window !== 'undefined' && window.electronAPI;
    this.cache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
  }

  // === DÉTECTION DE CONTEXTE ===
  
  isElectronApp() {
    return this.isElectron;
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
        result = await window.electronAPI.removeCryptoFavorite(symbol);
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
        // Mode Electron - SQLite local
        console.log('🖥️ [ADAPTER] Récupération via Electron API');
        events = await window.electronAPI.getCalendarEvents(timeMin, timeMax);
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

  async addCalendarEvent(eventData) {
    try {
      const formattedEvent = this.formatEventForStorage(eventData);
      let result;
      
      if (this.isElectron) {
        // Mode Electron - SQLite local
        result = await window.electronAPI.addCalendarEvent(formattedEvent);
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
        // Mode Electron - SQLite local
        result = await window.electronAPI.updateCalendarEvent(id, formattedEvent);
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
        // Mode Electron - SQLite local
        result = await window.electronAPI.deleteCalendarEvent(id);
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

  // === MÉTHODES UTILITAIRES ===
  
  formatEvent(event) {
    // Convertir l'événement vers le format Google Calendar standard
    if (!event) return null;
    
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
    return {
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
      attendees: event.attendees || [],
      created: event.created_at,
      updated: event.updated_at,
      source: 'local'
    };
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