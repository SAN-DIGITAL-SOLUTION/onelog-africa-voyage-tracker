import { vi, describe, it, expect, beforeEach } from 'vitest';
import { TimelineService, timelineService } from '../../../src/services/TimelineService';

describe('TimelineService', () => {
  beforeEach(() => {
    // Réinitialiser les mocks avant chaque test
    vi.clearAllMocks();
  });

  describe('getEvents', () => {
    it('récupère tous les événements sans filtre', async () => {
      const events = await timelineService.getEvents();
      
      expect(Array.isArray(events)).toBe(true);
      expect(events.length).toBeGreaterThan(0);
      expect(events[0]).toHaveProperty('id');
      expect(events[0]).toHaveProperty('type');
      expect(events[0]).toHaveProperty('title');
    });

    it('filtre les événements par type', async () => {
      const events = await timelineService.getEvents({ eventTypes: ['departure'] });
      
      expect(Array.isArray(events)).toBe(true);
      events.forEach(event => {
        expect(event.type).toBe('departure');
      });
    });

    it('filtre les événements par statut', async () => {
      const events = await timelineService.getEvents({ statuses: ['completed'] });
      
      expect(Array.isArray(events)).toBe(true);
      events.forEach(event => {
        expect(event.status).toBe('completed');
      });
    });
  });

  describe('getEventById', () => {
    it('récupère un événement par son ID', async () => {
      const allEvents = await timelineService.getEvents();
      const firstEventId = allEvents[0].id;
      
      const event = await timelineService.getEventById(firstEventId);
      
      expect(event).not.toBeNull();
      expect(event?.id).toBe(firstEventId);
    });

    it('retourne null pour un ID inexistant', async () => {
      const event = await timelineService.getEventById('inexistant');
      
      expect(event).toBeNull();
    });
  });

  describe('getAvailableVehicles', () => {
    it('retourne la liste des véhicules disponibles', async () => {
      const vehicles = await timelineService.getAvailableVehicles();
      
      expect(Array.isArray(vehicles)).toBe(true);
      expect(vehicles.length).toBeGreaterThan(0);
      expect(typeof vehicles[0]).toBe('string');
    });
  });

  describe('getEventStats', () => {
    it('retourne les statistiques des événements', async () => {
      const stats = await timelineService.getEventStats();
      
      expect(stats).toHaveProperty('total');
      expect(stats).toHaveProperty('byType');
      expect(stats).toHaveProperty('byStatus');
      expect(stats).toHaveProperty('bySeverity');
      expect(typeof stats.total).toBe('number');
      expect(stats.total).toBeGreaterThan(0);
    });
  });
});
