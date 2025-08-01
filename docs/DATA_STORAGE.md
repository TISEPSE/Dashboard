# 📁 Stockage des Données Chiffrées

## Emplacements par OS

### **Windows** 🪟
```
C:\Users\[NomUtilisateur]\AppData\Roaming\Dashboard\
├── dashboard.db          # Base SQLite chiffrée
├── .db-key              # Clé de chiffrement (permissions restreintes)
└── backups/             # Sauvegardes automatiques
    ├── dashboard-2024-01-15.db
    └── dashboard-2024-01-14.db
```

### **macOS** 🍎
```
/Users/[NomUtilisateur]/Library/Application Support/Dashboard/
├── dashboard.db
├── .db-key
└── backups/
```

### **Linux** 🐧
```
/home/[NomUtilisateur]/.config/Dashboard/
├── dashboard.db
├── .db-key
└── backups/
```

## Sécurité des Données

### **Chiffrement AES-256**
- **Descriptions d'événements** : Chiffrées
- **Lieux** : Chiffrés  
- **Données sensibles** : Chiffrées
- **Titres et dates** : Non chiffrés (pour les requêtes)

### **Protection de la Clé**
```javascript
// Permissions restrictives sur le fichier clé
fs.writeFileSync(keyPath, newKey, { mode: 0o600 }); // Lecture/écriture owner seulement
```

### **Exemple de données chiffrées**
```sql
-- Dans la base SQLite
INSERT INTO calendar_events (
  summary = "Rendez-vous médecin",           -- Non chiffré
  description = "U2FsdGVkX1+8xK...",        -- Chiffré AES-256
  location = "9xMnP2+vQd8K...",             -- Chiffré AES-256
  start_datetime = "2024-01-15T14:00:00"    -- Non chiffré
);
```

## Commandes Utiles

### **Localiser les données**
```javascript
// Dans l'app Electron
const { app } = require('electron');
const userDataPath = app.getPath('userData');
console.log('Données stockées dans:', userDataPath);
```

### **Sauvegarde manuelle**
```bash
# Copier la base de données
cp "%APPDATA%\Dashboard\dashboard.db" "C:\MesSauvegardes\"
```

### **Migration/Export**
Les données peuvent être exportées et importées sur un autre ordinateur en copiant :
- `dashboard.db` (base de données)
- `.db-key` (clé de chiffrement)

## ⚠️ Important

- **Ne jamais perdre** le fichier `.db-key` → Données irrécupérables
- **Sauvegardes automatiques** créées chaque jour
- **Accès uniquement** par l'utilisateur propriétaire du fichier