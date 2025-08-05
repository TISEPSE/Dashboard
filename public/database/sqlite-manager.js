const Database = require('better-sqlite3');
const CryptoJS = require('crypto-js');
const { app } = require('electron');
const path = require('path');
const fs = require('fs');

class SQLiteManager {
  constructor() {
    this.db = null;
    this.encryptionKey = this.getOrCreateEncryptionKey();
    this.initDatabase();
  }

  getOrCreateEncryptionKey() {
    const userDataPath = app.getPath('userData');
    const keyPath = path.join(userDataPath, '.db-key');
    
    try {
      // Essayer de lire la clé existante
      if (fs.existsSync(keyPath)) {
        return fs.readFileSync(keyPath, 'utf8');
      }
    } catch (error) {
      console.warn('Impossible de lire la clé existante, création d\'une nouvelle');
    }
    
    // Créer une nouvelle clé
    const newKey = CryptoJS.lib.WordArray.random(32).toString();
    
    try {
      // Créer le dossier si nécessaire
      fs.mkdirSync(path.dirname(keyPath), { recursive: true });
      // Sauvegarder la clé
      fs.writeFileSync(keyPath, newKey, { mode: 0o600 });
      return newKey;
    } catch (error) {
      console.error('Erreur création clé de chiffrement:', error);
      throw error;
    }
  }

  initDatabase() {
    try {
      const userDataPath = app.getPath('userData');
      const dbPath = path.join(userDataPath, 'dashboard.db');
      
      // Créer le dossier si nécessaire
      fs.mkdirSync(path.dirname(dbPath), { recursive: true });
      
      // Initialiser la base de données
      this.db = new Database(dbPath);
      
      // Activer WAL mode pour de meilleures performances
      this.db.pragma('journal_mode = WAL');
      
      // Créer les tables
      this.createTables();
      
      console.log('Base de données SQLite initialisée:', dbPath);
    } catch (error) {
      console.error('Erreur initialisation base de données:', error);
      throw error;
    }
  }

  createTables() {
    // Table des favoris crypto
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS crypto_favorites (
        id TEXT PRIMARY KEY,
        symbol TEXT NOT NULL,
        name TEXT NOT NULL,
        user_id TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(symbol, user_id)
      )
    `);

    // Table des événements du calendrier
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS calendar_events (
        id TEXT PRIMARY KEY,
        google_id TEXT UNIQUE,
        summary TEXT NOT NULL,
        description TEXT,
        location TEXT,
        start_datetime TEXT,
        start_date TEXT,
        end_datetime TEXT,
        end_date TEXT,
        color_id TEXT DEFAULT '1',
        attendees TEXT, -- JSON string
        user_id TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Table des paramètres utilisateur
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS user_settings (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        key TEXT NOT NULL,
        value TEXT NOT NULL, -- Valeur chiffrée
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, key)
      )
    `);

    console.log('Tables créées avec succès');
  }

  // Méthodes de chiffrement/déchiffrement
  encrypt(text) {
    if (!text) return text;
    return CryptoJS.AES.encrypt(text, this.encryptionKey).toString();
  }

  decrypt(encryptedText) {
    if (!encryptedText) return encryptedText;
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedText, this.encryptionKey);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error('Erreur déchiffrement:', error);
      return encryptedText; // Retourner le texte original si le déchiffrement échoue
    }
  }

  // === MÉTHODES NAVBAR PREFERENCES ===
  
  getNavbarPreferences() {
    try {
      const stmt = this.db.prepare(`
        SELECT value FROM user_settings 
        WHERE key = ? AND user_id = ?
      `);
      const result = stmt.get('navbar_preferences', 'default_user');
      
      if (result) {
        const decrypted = this.decrypt(result.value);
        return JSON.parse(decrypted);
      }
      
      // Retourner les valeurs par défaut si aucune préférence trouvée
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
    } catch (error) {
      console.error('Erreur récupération préférences navbar:', error);
      return this.getDefaultNavbarPreferences();
    }
  }

  saveNavbarPreferences(preferences) {
    try {
      const encrypted = this.encrypt(JSON.stringify(preferences));
      const stmt = this.db.prepare(`
        INSERT OR REPLACE INTO user_settings (id, user_id, key, value, updated_at)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
      `);
      
      const id = this.generateId();
      stmt.run(id, 'default_user', 'navbar_preferences', encrypted);
      
      console.log('✅ [SQLITE] Préférences navbar sauvegardées:', preferences);
      return { success: true };
    } catch (error) {
      console.error('❌ [SQLITE] Erreur sauvegarde préférences navbar:', error);
      throw error;
    }
  }

  getNavbarOrder() {
    try {
      const stmt = this.db.prepare(`
        SELECT value FROM user_settings 
        WHERE key = ? AND user_id = ?
      `);
      const result = stmt.get('navbar_order', 'default_user');
      
      if (result) {
        const decrypted = this.decrypt(result.value);
        return JSON.parse(decrypted);
      }
      
      // Retourner l'ordre par défaut si aucun ordre trouvé
      return [
        'home',
        'crypto', 
        'message',
        'meteo',
        'sante',
        'finances',
        'calendrier'
      ];
    } catch (error) {
      console.error('Erreur récupération ordre navbar:', error);
      return this.getDefaultNavbarOrder();
    }
  }

  saveNavbarOrder(order) {
    try {
      const encrypted = this.encrypt(JSON.stringify(order));
      const stmt = this.db.prepare(`
        INSERT OR REPLACE INTO user_settings (id, user_id, key, value, updated_at)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
      `);
      
      const id = this.generateId();
      stmt.run(id, 'default_user', 'navbar_order', encrypted);
      
      console.log('✅ [SQLITE] Ordre navbar sauvegardé:', order);
      return { success: true };
    } catch (error) {
      console.error('❌ [SQLITE] Erreur sauvegarde ordre navbar:', error);
      throw error;
    }
  }

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

  // Méthode pour fermer la base de données
  close() {
    if (this.db) {
      this.db.close();
      console.log('✅ Base de données SQLite fermée');
    }
  }

  // === MÉTHODES CRYPTO FAVORITES ===
  
  getCryptoFavorites() {
    try {
      const stmt = this.db.prepare(`
        SELECT id, symbol, name, user_id, created_at, updated_at 
        FROM crypto_favorites 
        ORDER BY created_at DESC
      `);
      return stmt.all();
    } catch (error) {
      console.error('Erreur récupération favoris crypto:', error);
      return [];
    }
  }

  addCryptoFavorite({ symbol, name, userId = null }) {
    try {
      const id = this.generateId();
      const stmt = this.db.prepare(`
        INSERT INTO crypto_favorites (id, symbol, name, user_id)
        VALUES (?, ?, ?, ?)
      `);
      
      stmt.run(id, symbol, name, userId);
      return { id, symbol, name, userId };
    } catch (error) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        throw new Error('Ce crypto est déjà dans vos favoris');
      }
      throw error;
    }
  }

  removeCryptoFavorite(symbol) {
    try {
      console.log('🗑️ [SQLITE] Suppression favori par symbol:', symbol);
      const stmt = this.db.prepare('DELETE FROM crypto_favorites WHERE symbol = ?');
      const result = stmt.run(symbol.toLowerCase());
      console.log('🗑️ [SQLITE] Résultat suppression:', result.changes, 'lignes affectées');
      return result.changes > 0;
    } catch (error) {
      console.error('❌ [SQLITE] Erreur suppression favori crypto:', error);
      throw error;
    }
  }

  // === MÉTHODES CALENDAR EVENTS ===
  
  getCalendarEvents(timeMin, timeMax) {
    try {
      let query = `
        SELECT id, google_id, summary, description, location,
               start_datetime, start_date, end_datetime, end_date,
               color_id, attendees, user_id, created_at, updated_at
        FROM calendar_events
      `;
      
      const params = [];
      
      if (timeMin || timeMax) {
        query += ' WHERE ';
        const conditions = [];
        
        if (timeMin) {
          conditions.push('(start_datetime >= ? OR start_date >= ?)');
          params.push(timeMin, timeMin.split('T')[0]);
        }
        
        if (timeMax) {
          conditions.push('(end_datetime <= ? OR end_date <= ?)');
          params.push(timeMax, timeMax.split('T')[0]);
        }
        
        query += conditions.join(' AND ');
      }
      
      query += ' ORDER BY start_datetime, start_date';
      
      const stmt = this.db.prepare(query);
      const events = stmt.all(...params);
      
      // Déchiffrer les données sensibles et parser les JSON
      return events.map(event => ({
        ...event,
        description: event.description ? this.decrypt(event.description) : null,
        location: event.location ? this.decrypt(event.location) : null,
        attendees: event.attendees ? JSON.parse(event.attendees) : null
      }));
    } catch (error) {
      console.error('Erreur récupération événements:', error);
      return [];
    }
  }

  addCalendarEvent(eventData) {
    try {
      // Si l'événement a un googleId, vérifier s'il existe déjà
      if (eventData.googleId) {
        const existingStmt = this.db.prepare('SELECT id FROM calendar_events WHERE google_id = ?');
        const existing = existingStmt.get(eventData.googleId);
        if (existing) {
          console.log('✅ [SQLITE] Événement Google existe déjà, mise à jour:', eventData.googleId);
          return this.updateCalendarEvent(existing.id, eventData);
        }
      }
      
      const id = eventData.id || this.generateId();
      const stmt = this.db.prepare(`
        INSERT OR REPLACE INTO calendar_events (
          id, google_id, summary, description, location,
          start_datetime, start_date, end_datetime, end_date,
          color_id, attendees, user_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      const result = stmt.run(
        id,
        eventData.googleId || null,
        eventData.summary,
        eventData.description ? this.encrypt(eventData.description) : null,
        eventData.location ? this.encrypt(eventData.location) : null,
        eventData.start?.dateTime || null,
        eventData.start?.date || null,
        eventData.end?.dateTime || null,
        eventData.end?.date || null,
        eventData.colorId || '1',
        eventData.attendees ? JSON.stringify(eventData.attendees) : null,
        eventData.userId || null
      );
      
      console.log('✅ [SQLITE] Nouvel événement ajouté:', id, eventData.googleId ? '(Google)' : '(Local)');
      return { ...eventData, id };
    } catch (error) {
      console.error('Erreur ajout événement:', error);
      throw error;
    }
  }

  updateCalendarEvent(id, eventData) {
    try {
      // Si on met à jour par google_id, chercher l'événement correspondant
      let actualId = id;
      if (eventData.googleId) {
        const findStmt = this.db.prepare('SELECT id FROM calendar_events WHERE google_id = ?');
        const existing = findStmt.get(eventData.googleId);
        if (existing) {
          actualId = existing.id;
        }
      }
      
      const stmt = this.db.prepare(`
        UPDATE calendar_events SET
          summary = ?, description = ?, location = ?,
          start_datetime = ?, start_date = ?, end_datetime = ?, end_date = ?,
          color_id = ?, attendees = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ? OR google_id = ?
      `);
      
      const result = stmt.run(
        eventData.summary,
        eventData.description ? this.encrypt(eventData.description) : null,
        eventData.location ? this.encrypt(eventData.location) : null,
        eventData.start?.dateTime || null,
        eventData.start?.date || null,
        eventData.end?.dateTime || null,
        eventData.end?.date || null,
        eventData.colorId || '1',
        eventData.attendees ? JSON.stringify(eventData.attendees) : null,
        actualId,
        eventData.googleId || null
      );
      
      return result.changes > 0;
    } catch (error) {
      console.error('Erreur mise à jour événement:', error);
      throw error;
    }
  }

  deleteCalendarEvent(id) {
    try {
      const stmt = this.db.prepare('DELETE FROM calendar_events WHERE id = ?');
      const result = stmt.run(id);
      return result.changes > 0;
    } catch (error) {
      console.error('Erreur suppression événement:', error);
      throw error;
    }
  }

  // Synchronisation en lot des événements Google
  syncGoogleEvents(googleEvents) {
    try {
      console.log('🔄 [SQLITE] Démarrage synchronisation en lot:', googleEvents.length, 'événements');
      
      // Démarrer une transaction pour les performances
      const transaction = this.db.transaction((events) => {
        let syncedCount = 0;
        let updatedCount = 0;
        
        for (const event of events) {
          try {
            // Vérifier si l'événement existe déjà
            const existingStmt = this.db.prepare('SELECT id FROM calendar_events WHERE google_id = ?');
            const existing = existingStmt.get(event.id);
            
            if (existing) {
              // Mettre à jour
              const updateStmt = this.db.prepare(`
                UPDATE calendar_events SET
                  summary = ?, description = ?, location = ?,
                  start_datetime = ?, start_date = ?, end_datetime = ?, end_date = ?,
                  color_id = ?, attendees = ?, updated_at = CURRENT_TIMESTAMP
                WHERE google_id = ?
              `);
              
              updateStmt.run(
                event.summary,
                event.description ? this.encrypt(event.description) : null,
                event.location ? this.encrypt(event.location) : null,
                event.start?.dateTime || null,
                event.start?.date || null,
                event.end?.dateTime || null,
                event.end?.date || null,
                event.colorId || '1',
                event.attendees ? JSON.stringify(event.attendees) : null,
                event.id
              );
              updatedCount++;
            } else {
              // Insérer nouveau
              const insertStmt = this.db.prepare(`
                INSERT INTO calendar_events (
                  id, google_id, summary, description, location,
                  start_datetime, start_date, end_datetime, end_date,
                  color_id, attendees, user_id
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
              `);
              
              const newId = this.generateId();
              insertStmt.run(
                newId,
                event.id,
                event.summary,
                event.description ? this.encrypt(event.description) : null,
                event.location ? this.encrypt(event.location) : null,
                event.start?.dateTime || null,
                event.start?.date || null,
                event.end?.dateTime || null,
                event.end?.date || null,
                event.colorId || '1',
                event.attendees ? JSON.stringify(event.attendees) : null,
                'default_user'
              );
              syncedCount++;
            }
          } catch (eventError) {
            console.error('❌ [SQLITE] Erreur sync événement:', event.id, eventError);
          }
        }
        
        return { syncedCount, updatedCount };
      });
      
      const result = transaction(googleEvents);
      console.log(`✅ [SQLITE] Synchronisation terminée: ${result.syncedCount} ajoutés, ${result.updatedCount} mis à jour`);
      
      return result;
    } catch (error) {
      console.error('❌ [SQLITE] Erreur synchronisation en lot:', error);
      throw error;
    }
  }

  // === MÉTHODES UTILITAIRES ===
  
  generateId() {
    return 'local_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  close() {
    if (this.db) {
      this.db.close();
    }
  }

  // Sauvegarde de la base de données
  backup(backupPath) {
    try {
      this.db.backup(backupPath);
      console.log('Sauvegarde créée:', backupPath);
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      throw error;
    }
  }
}

// Singleton
let instance = null;

module.exports = {
  getInstance() {
    if (!instance) {
      instance = new SQLiteManager();
    }
    return instance;
  },
  
  // Méthodes statiques pour l'interface - Crypto
  getCryptoFavorites: () => module.exports.getInstance().getCryptoFavorites(),
  addCryptoFavorite: (crypto) => module.exports.getInstance().addCryptoFavorite(crypto),
  removeCryptoFavorite: (id) => module.exports.getInstance().removeCryptoFavorite(id),
  
  // Méthodes statiques pour l'interface - Calendar
  getCalendarEvents: (timeMin, timeMax) => module.exports.getInstance().getCalendarEvents(timeMin, timeMax),
  addCalendarEvent: (eventData) => module.exports.getInstance().addCalendarEvent(eventData),
  updateCalendarEvent: (id, eventData) => module.exports.getInstance().updateCalendarEvent(id, eventData),
  deleteCalendarEvent: (id) => module.exports.getInstance().deleteCalendarEvent(id),
  syncGoogleEvents: (googleEvents) => module.exports.getInstance().syncGoogleEvents(googleEvents),
  
  // Méthodes statiques pour l'interface - Navbar
  getNavbarPreferences: () => module.exports.getInstance().getNavbarPreferences(),
  saveNavbarPreferences: (preferences) => module.exports.getInstance().saveNavbarPreferences(preferences),
  getNavbarOrder: () => module.exports.getInstance().getNavbarOrder(),
  saveNavbarOrder: (order) => module.exports.getInstance().saveNavbarOrder(order),
  getDefaultNavbarPreferences: () => module.exports.getInstance().getDefaultNavbarPreferences(),
  getDefaultNavbarOrder: () => module.exports.getInstance().getDefaultNavbarOrder(),
  
  close: () => {
    if (instance) {
      instance.close();
      instance = null;
    }
  }
};