# Dashboard - Application Hybride Web/Desktop

Une application de dashboard moderne avec support hybride web et desktop (Electron) utilisant SQLite local chiffré.

## 🚀 Fonctionnalités

- **🌐 Mode Web** : Interface web classique avec APIs REST
- **💻 Mode Desktop** : Application Electron avec base de données SQLite locale chiffrée
- **📅 Calendrier** : Gestion d'événements avec synchronisation Google Calendar (mode web)
- **₿ Crypto** : Suivi des cryptomonnaies avec gestion des favoris
- **🔒 Chiffrement** : Données sensibles chiffrées avec AES-256
- **🔄 Mises à jour automatiques** : Système de mise à jour intégré pour l'app desktop

## 📦 Installation

```bash
# Cloner le projet
git clone <repository-url>
cd Dashboard

# Installer les dépendances
npm install

# Initialiser la base de données SQLite
npm run postinstall
```

## 🛠️ Développement

### Mode Web
```bash
# Développement web classique
npm run dev
# ➜ http://localhost:3000
```

### Mode Electron (Desktop)
```bash
# Développement Electron avec hot reload
npm run electron:dev
# ➜ Ouvre l'application desktop
```

## 🏗️ Build & Distribution

### Build Web
```bash
npm run build
npm run start
```

### Build Electron
```bash
# Package pour la plateforme courante
npm run electron:pack

# Build pour distribution
npm run electron:dist
```

## 📁 Architecture

```
Dashboard/
├── src/app/                    # Code Next.js
│   ├── lib/database-adapter.js # Adaptateur base de données
│   ├── hooks/useCalendar.js    # Hook calendrier unifié
│   └── api/                    # APIs REST (mode web)
├── public/
│   ├── electron.js             # Processus principal Electron
│   ├── preload.js              # Script sécurisé
│   └── database/
│       └── sqlite-manager.js   # Gestionnaire SQLite chiffré
├── scripts/
│   └── init-sqlite.js          # Initialisation base de données
└── config/                     # Configuration app
```

## 🔐 Sécurité

- **Chiffrement AES-256** : Toutes les données sensibles sont chiffrées
- **Clé unique** : Chaque installation génère sa propre clé de chiffrement
- **Stockage sécurisé** : Clés stockées dans le dossier utilisateur avec permissions restrictives
- **Isolation** : Mode Electron avec `contextIsolation` activé

## 💾 Base de Données

### Mode Web
- APIs REST avec stockage en mémoire (fallback)
- Support Google Calendar pour synchronisation

### Mode Desktop  
- SQLite local avec chiffrement
- Stockage dans `%APPDATA%\Dashboard` (Windows) ou `~/.config/Dashboard` (Linux/Mac)
- Sauvegarde automatique

## 🔄 Synchronisation

### Mode Web
- Synchronisation directe avec Google Calendar
- Gestion des tokens d'authentification

### Mode Desktop
- Base de données locale autonome
- Pas de dépendance réseau
- Données totalement privées

## 📋 Scripts Disponibles

```bash
npm run dev              # Développement web
npm run electron:dev     # Développement Electron  
npm run build           # Build web
npm run electron:pack   # Package Electron
npm run electron:dist   # Distribution Electron
npm run db:init         # Initialiser base de données
```

## 🎯 Avantages de l'Architecture Hybride

### Mode Web
✅ Accès depuis n'importe quel navigateur  
✅ Synchronisation Google Calendar  
✅ Mises à jour automatiques  
✅ Partage facile  

### Mode Desktop
✅ Données 100% privées et chiffrées  
✅ Pas de dépendance internet  
✅ Performances optimales  
✅ Contrôle total des données  

## 🔧 Configuration

### Variables d'environnement (mode web)
```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXTAUTH_SECRET=your_nextauth_secret
```

### Configuration Electron
Voir `config/electron.json` pour personnaliser la fenêtre et les mises à jour.

## 🆘 Support

- Mode web : Utilise les APIs REST classiques
- Mode desktop : Base de données SQLite locale autonome  
- Les deux modes partagent la même interface utilisateur

---

**Développé avec ❤️ en utilisant Next.js, Electron, et SQLite**