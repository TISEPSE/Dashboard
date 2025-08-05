// Script de debug pour tester les événements SQLite directement

console.log('🔍 [DEBUG] Début test événements SQLite');

// Simuler un événement de test
const testEvent = {
  id: 'test_' + Date.now(),
  summary: 'Événement de Test',
  description: 'Ceci est un test de synchronisation SQLite',
  location: 'Chez moi',
  start: {
    dateTime: '2025-08-06T10:00:00.000Z'
  },
  end: {
    dateTime: '2025-08-06T11:00:00.000Z'
  },
  colorId: '1',
  attendees: [],
  userId: 'test_user'
};

console.log('📝 [DEBUG] Événement de test créé:', testEvent);

// Test uniquement en développement - à supprimer en production
if (typeof window !== 'undefined' && window.electronAPI) {
  console.log('🖥️ [DEBUG] Mode Electron détecté');
  
  // Test d'ajout d'événement
  window.electronAPI.addCalendarEvent(testEvent).then(result => {
    console.log('✅ [DEBUG] Événement ajouté avec succès:', result);
    
    // Test de récupération
    return window.electronAPI.getCalendarEvents();
  }).then(events => {
    console.log('📅 [DEBUG] Événements récupérés:', events);
  }).catch(error => {
    console.error('❌ [DEBUG] Erreur test:', error);
  });
} else {
  console.log('🌐 [DEBUG] Mode web ou electronAPI non disponible');
}