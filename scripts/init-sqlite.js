const fs = require('fs');
const path = require('path');
const os = require('os');

// Simuler le chemin userData pour le mode web
function initSQLiteForWeb() {
  console.log('🗄️  Initialisation SQLite pour le mode web...');
  
  // Créer le dossier de données dans le répertoire de l'utilisateur
  const userDataPath = path.join(os.homedir(), '.dashboard-app');
  
  try {
    // Créer le dossier s'il n'existe pas
    if (!fs.existsSync(userDataPath)) {
      fs.mkdirSync(userDataPath, { recursive: true });
      console.log('✅ Dossier de données créé:', userDataPath);
    }
    
    // Créer le dossier database
    const databasePath = path.join(userDataPath, 'database');
    if (!fs.existsSync(databasePath)) {
      fs.mkdirSync(databasePath, { recursive: true });
      console.log('✅ Dossier database créé:', databasePath);
    }
    
    // Créer le dossier backups
    const backupsPath = path.join(userDataPath, 'backups');
    if (!fs.existsSync(backupsPath)) {
      fs.mkdirSync(backupsPath, { recursive: true });
      console.log('✅ Dossier backups créé:', backupsPath);
    }
    
    console.log('✅ Structure de données SQLite initialisée avec succès');
    console.log('📁 Données stockées dans:', userDataPath);
    
  } catch (error) {
    console.error('❌ Erreur initialisation SQLite:', error);
  }
}

// Fonction pour vérifier les dépendances
function checkDependencies() {
  const packagePath = path.join(__dirname, '..', 'package.json');
  
  try {
    const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    const dependencies = { ...packageData.dependencies, ...packageData.devDependencies };
    
    const requiredDeps = ['better-sqlite3', 'crypto-js', 'electron'];
    const missingDeps = requiredDeps.filter(dep => !dependencies[dep]);
    
    if (missingDeps.length > 0) {
      console.warn('⚠️  Dépendances manquantes:', missingDeps.join(', '));
      console.log('💡 Exécutez: npm install');
      return false;
    }
    
    console.log('✅ Toutes les dépendances SQLite sont présentes');
    return true;
  } catch (error) {
    console.error('❌ Erreur vérification dépendances:', error);
    return false;
  }
}

// Fonction pour créer les fichiers de configuration
function createConfigFiles() {
  const configDir = path.join(__dirname, '..', 'config');
  
  try {
    // Créer le dossier config s'il n'existe pas
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    
    // Configuration de la base de données
    const dbConfig = {
      type: 'sqlite',
      encryption: true,
      autoBackup: true,
      backupInterval: 24 * 60 * 60 * 1000, // 24 heures
      maxBackups: 7
    };
    
    const dbConfigPath = path.join(configDir, 'database.json');
    fs.writeFileSync(dbConfigPath, JSON.stringify(dbConfig, null, 2));
    console.log('✅ Configuration database créée:', dbConfigPath);
    
    // Configuration Electron
    const electronConfig = {
      window: {
        width: 1400,
        height: 900,
        minWidth: 800,
        minHeight: 600
      },
      updater: {
        enabled: true,
        checkInterval: 60 * 60 * 1000 // 1 heure
      }
    };
    
    const electronConfigPath = path.join(configDir, 'electron.json');
    fs.writeFileSync(electronConfigPath, JSON.stringify(electronConfig, null, 2));
    console.log('✅ Configuration Electron créée:', electronConfigPath);
    
  } catch (error) {
    console.error('❌ Erreur création fichiers config:', error);
  }
}

// Script principal
function main() {
  console.log('🚀 Initialisation du projet Dashboard avec SQLite...\n');
  
  // Vérifier les dépendances
  if (!checkDependencies()) {
    process.exit(1);
  }
  
  // Initialiser SQLite
  initSQLiteForWeb();
  
  // Créer les fichiers de configuration
  createConfigFiles();
  
  console.log('\n🎉 Initialisation terminée avec succès !');
  console.log('📖 Commandes disponibles:');
  console.log('   - npm run dev          : Mode développement web');
  console.log('   - npm run electron:dev : Mode développement Electron');
  console.log('   - npm run build        : Build pour production');
  console.log('   - npm run electron:pack: Package Electron');
}

// Exécuter seulement si appelé directement
if (require.main === module) {
  main();
}

module.exports = {
  initSQLiteForWeb,
  checkDependencies,
  createConfigFiles
};