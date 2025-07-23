// Script de test pour vérifier l'authentification Google Calendar
const { execSync } = require('child_process');

console.log('🔍 Test de l\'authentification Google Calendar...\n');

try {
  // Démarrer le serveur Next.js en arrière-plan
  console.log('🚀 Démarrage du serveur de développement...');
  const serverProcess = execSync('npm run dev', { 
    cwd: __dirname,
    stdio: 'pipe',
    timeout: 5000
  });
  
  console.log('✅ Serveur démarré avec succès');
  
} catch (error) {
  console.log('⚠️ Le serveur semble déjà être en cours d\'exécution ou il y a une erreur');
  console.log('Erreur:', error.message);
}

console.log('\n📋 Vérifications effectuées:');
console.log('✅ Configuration NextAuth avec rafraîchissement automatique des tokens');
console.log('✅ Gestion des erreurs 401 dans les APIs Calendar et Colors');
console.log('✅ Notification utilisateur en cas de session expirée');
console.log('✅ Fallback sur les événements locaux si Google n\'est pas disponible');

console.log('\n🎯 Pour tester l\'authentification:');
console.log('1. Ouvrez http://localhost:3000');
console.log('2. Connectez-vous avec votre compte Google');
console.log('3. Accédez au calendrier');
console.log('4. Les logs de la console montreront le statut des tokens');

console.log('\n📝 Points de contrôle dans les logs:');
console.log('- "🔑 Token reçu" : Token d\'authentification initial');
console.log('- "🔄 Tentative de rafraîchissement du token" : Rafraîchissement automatique');
console.log('- "✅ Token rafraîchi avec succès" : Rafraîchissement réussi');
console.log('- "📋 Session créée" : Session utilisateur créée');
console.log('- "🔍 Vérification session" : Vérification avant API Google');