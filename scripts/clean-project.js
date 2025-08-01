const fs = require('fs');
const path = require('path');

// Fichiers et dossiers à supprimer
const filesToDelete = [
  'android',
  'capacitor.config.ts',
  'fix-prisma.js',
  'init-db.js',
  'lib',
  'prisma',
  'scripts/migrate-to-postgres.js',
  'scripts/clean-dev.sh',
  'scripts/dev-watcher.sh',
  'setup-db.ps1',
  'setup-neon.js',
  'test-auth.js',
  'test-calendar.html',
  'src/app/services/localCalendar.js',
  'src/app/hook',
  'src/app/contexts'
];

// Fonction pour supprimer récursivement un dossier
function deleteFolderRecursive(folderPath) {
  if (fs.existsSync(folderPath)) {
    fs.readdirSync(folderPath).forEach((file) => {
      const curPath = path.join(folderPath, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        deleteFolderRecursive(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(folderPath);
  }
}

// Fonction pour supprimer un fichier ou dossier
function deleteItem(itemPath) {
  const fullPath = path.join(__dirname, '..', itemPath);
  
  try {
    if (fs.existsSync(fullPath)) {
      const stats = fs.lstatSync(fullPath);
      
      if (stats.isDirectory()) {
        deleteFolderRecursive(fullPath);
        console.log(`✅ Dossier supprimé: ${itemPath}`);
      } else {
        fs.unlinkSync(fullPath);
        console.log(`✅ Fichier supprimé: ${itemPath}`);
      }
    } else {
      console.log(`⏭️  N'existe pas: ${itemPath}`);
    }
  } catch (error) {
    console.error(`❌ Erreur suppression ${itemPath}:`, error.message);
  }
}

// Script principal
function cleanProject() {
  console.log('🧹 Nettoyage du projet Dashboard...\n');
  
  filesToDelete.forEach(deleteItem);
  
  console.log('\n🎉 Nettoyage terminé !');
  console.log('📁 Fichiers et dossiers obsolètes supprimés.');
}

// Exécuter le nettoyage
if (require.main === module) {
  cleanProject();
}

module.exports = { cleanProject };