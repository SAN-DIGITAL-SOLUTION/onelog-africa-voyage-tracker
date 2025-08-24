#!/usr/bin/env node

/**
 * Script de validation de l'API Timeline Dashboard
 * Vérifie l'intégrité des endpoints et des données
 */

const { TimelineService } = require('../src/services/timeline/TimelineService');

async function validateTimelineAPI() {
  console.log('🔍 Validation de l\'API Timeline Dashboard...\n');
  
  let passed = 0;
  let failed = 0;
  
  // Test 1: Service instantiation
  try {
    const service = new TimelineService();
    console.log('✅ Service TimelineService instantié correctement');
    passed++;
  } catch (error) {
    console.error('❌ Erreur d\'instantiation du service:', error.message);
    failed++;
  }
  
  // Test 2: Mock data validation
  try {
    const service = new TimelineService();
    const events = await service.getEvents();
    
    if (events && events.length > 0) {
      console.log(`✅ Récupération des événements: ${events.length} événements`);
      passed++;
    } else {
      console.error('❌ Aucun événement récupéré');
      failed++;
    }
  } catch (error) {
    console.error('❌ Erreur de récupération des événements:', error.message);
    failed++;
  }
  
  // Test 3: Filtering functionality
  try {
    const service = new TimelineService();
    const filters = {
      eventTypes: ['departure'],
      vehicleIds: ['CI-001']
    };
    
    const filteredEvents = await service.getEvents(filters);
    console.log(`✅ Filtrage fonctionnel: ${filteredEvents.length} événements filtrés`);
    passed++;
  } catch (error) {
    console.error('❌ Erreur de filtrage:', error.message);
    failed++;
  }
  
  // Test 4: Data structure validation
  try {
    const service = new TimelineService();
    const events = await service.getEvents();
    const firstEvent = events[0];
    
    const requiredFields = ['id', 'type', 'timestamp', 'vehicleId', 'status'];
    const hasAllFields = requiredFields.every(field => firstEvent.hasOwnProperty(field));
    
    if (hasAllFields) {
      console.log('✅ Structure des données validée');
      passed++;
    } else {
      console.error('❌ Structure des données invalide');
      failed++;
    }
  } catch (error) {
    console.error('❌ Erreur de validation de structure:', error.message);
    failed++;
  }
  
  // Résumé
  console.log('\n📊 Résumé de la validation:');
  console.log(`✅ Tests réussis: ${passed}`);
  console.log(`❌ Tests échoués: ${failed}`);
  console.log(`📈 Taux de réussite: ${Math.round((passed / (passed + failed)) * 100)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 Validation API Timeline réussie!');
    process.exit(0);
  } else {
    console.log('\n⚠️ Validation API Timeline échouée!');
    process.exit(1);
  }
}

// Exécution
validateTimelineAPI().catch(error => {
  console.error('💥 Erreur critique:', error);
  process.exit(1);
});
