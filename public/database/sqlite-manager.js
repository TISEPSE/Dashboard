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

  removeCryptoFavorite(id) {
    try {
      const stmt = this.db.prepare('DELETE FROM crypto_favorites WHERE id = ?');
      const result = stmt.run(id);
      return result.changes > 0;
    } catch (error) {
      console.error('Erreur suppression favori crypto:', error);
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
      
      return { ...eventData, id };
    } catch (error) {
      console.error('Erreur ajout événement:', error);
      throw error;
    }
  }

  updateCalendarEvent(id, eventData) {
    try {
      const stmt = this.db.prepare(`
        UPDATE calendar_events SET
          summary = ?, description = ?, location = ?,
          start_datetime = ?, start_date = ?, end_datetime = ?, end_date = ?,
          color_id = ?, attendees = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
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
        id
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
  
  // Méthodes statiques pour l'interface
  getCryptoFavorites: () => module.exports.getInstance().getCryptoFavorites(),
  addCryptoFavorite: (crypto) => module.exports.getInstance().addCryptoFavorite(crypto),
  removeCryptoFavorite: (id) => module.exports.getInstance().removeCryptoFavorite(id),
  
  getCalendarEvents: (timeMin, timeMax) => module.exports.getInstance().getCalendarEvents(timeMin, timeMax),
  addCalendarEvent: (eventData) => module.exports.getInstance().addCalendarEvent(eventData),
  updateCalendarEvent: (id, eventData) => module.exports.getInstance().updateCalendarEvent(id, eventData),
  deleteCalendarEvent: (id) => module.exports.getInstance().deleteCalendarEvent(id),
  
  close: () => {
    if (instance) {
      instance.close();
      instance = null;
    }
  }
};