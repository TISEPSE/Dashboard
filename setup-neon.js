#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Configuration de Neon PostgreSQL...');

try {
  console.log('📊 Génération du client Prisma...');
  execSync('npx prisma generate', { 
    stdio: 'inherit', 
    cwd: __dirname 
  });

  console.log('🗄️ Synchronisation du schéma avec Neon...');
  execSync('npx prisma db push', { 
    stdio: 'inherit', 
    cwd: __dirname 
  });

  console.log('✅ Configuration terminée avec succès !');
  console.log('🔄 Redémarrez maintenant votre serveur Next.js');
  
} catch (error) {
  console.error('❌ Erreur lors de la configuration :', error.message);
  process.exit(1);
}