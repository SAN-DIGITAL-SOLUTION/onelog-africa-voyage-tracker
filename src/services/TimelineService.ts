import { TimelineEvent, TimelineFilters } from '../components/timeline/types';

// Mock data for development
const mockEvents: TimelineEvent[] = [
  {
    id: 'evt_001',
    timestamp: new Date('2025-07-17T08:00:00Z'),
    type: 'departure',
    title: 'Départ Abidjan',
    description: 'Départ du véhicule CI-001 vers Bouaké avec chargement complet',
    vehicleId: 'CI-001',
    driverId: 'DRV-123',
    location: {
      lat: 5.3600,
      lng: -4.0083,
      address: 'Port Autonome d\'Abidjan, Côte d\'Ivoire'
    },
    status: 'completed',
    metadata: {
      cargo: 'Marchandises diverses',
      weight: '15.5 tonnes',
      destination: 'Bouaké'
    }
  },
  {
    id: 'evt_002',
    timestamp: new Date('2025-07-17T10:30:00Z'),
    type: 'incident',
    title: 'Panne mécanique',
    description: 'Problème moteur détecté sur CI-002, intervention nécessaire',
    vehicleId: 'CI-002',
    driverId: 'DRV-456',
    location: {
      lat: 5.2500,
      lng: -3.9000,
      address: 'Autoroute du Nord, Km 45'
    },
    status: 'in_progress',
    severity: 'high',
    metadata: {
      issueType: 'Moteur',
      estimatedRepairTime: '2 heures',
      mechanicAssigned: 'MECH-789'
    },
    relatedEvents: ['evt_003']
  },
  {
    id: 'evt_003',
    timestamp: new Date('2025-07-17T12:45:00Z'),
    type: 'maintenance',
    title: 'Réparation terminée',
    description: 'Réparation du moteur CI-002 terminée avec succès',
    vehicleId: 'CI-002',
    driverId: 'DRV-456',
    location: {
      lat: 5.2500,
      lng: -3.9000,
      address: 'Autoroute du Nord, Km 45'
    },
    status: 'completed',
    severity: 'medium',
    metadata: {
      repairCost: '150,000 FCFA',
      partsReplaced: 'Filtre à huile, Courroie',
      mechanicAssigned: 'MECH-789'
    },
    relatedEvents: ['evt_002']
  },
  {
    id: 'evt_004',
    timestamp: new Date('2025-07-17T14:15:00Z'),
    type: 'arrival',
    title: 'Arrivée Bouaké',
    description: 'Livraison réussie à Bouaké, déchargement en cours',
    vehicleId: 'CI-001',
    driverId: 'DRV-123',
    location: {
      lat: 7.6900,
      lng: -5.0300,
      address: 'Marché Central de Bouaké'
    },
    status: 'completed',
    metadata: {
      deliveryTime: '6h 15min',
      fuelConsumed: '85 litres',
      distance: '348 km'
    }
  },
  {
    id: 'evt_005',
    timestamp: new Date('2025-07-17T16:00:00Z'),
    type: 'delay',
    title: 'Retard livraison',
    description: 'Retard de 2h sur la livraison CI-003 due aux embouteillages',
    vehicleId: 'CI-003',
    driverId: 'DRV-789',
    location: {
      lat: 5.3200,
      lng: -4.0400,
      address: 'Boulevard Lagunaire, Abidjan'
    },
    status: 'delayed',
    severity: 'medium',
    metadata: {
      originalETA: '14:00',
      newETA: '16:00',
      reason: 'Embouteillages'
    }
  },
  {
    id: 'evt_006',
    timestamp: new Date('2025-07-16T09:30:00Z'),
    type: 'departure',
    title: 'Départ Yamoussoukro',
    description: 'Départ matinal vers Abidjan avec chargement prioritaire',
    vehicleId: 'CI-004',
    driverId: 'DRV-101',
    location: {
      lat: 6.8276,
      lng: -5.2893,
      address: 'Gare Routière de Yamoussoukro'
    },
    status: 'completed',
    metadata: {
      priority: 'High',
      cargo: 'Produits pharmaceutiques',
      temperature: 'Contrôlée'
    }
  },
  {
    id: 'evt_007',
    timestamp: new Date('2025-07-16T11:45:00Z'),
    type: 'incident',
    title: 'Contrôle routier',
    description: 'Contrôle de routine par la gendarmerie, documents vérifiés',
    vehicleId: 'CI-004',
    driverId: 'DRV-101',
    location: {
      lat: 6.1000,
      lng: -4.8000,
      address: 'Poste de contrôle Tiassalé'
    },
    status: 'completed',
    severity: 'low',
    metadata: {
      duration: '15 minutes',
      documentsStatus: 'Conformes',
      officer: 'GND-456'
    }
  },
  {
    id: 'evt_008',
    timestamp: new Date('2025-07-16T13:20:00Z'),
    type: 'arrival',
    title: 'Arrivée Abidjan',
    description: 'Livraison pharmaceutique terminée avec succès',
    vehicleId: 'CI-004',
    driverId: 'DRV-101',
    location: {
      lat: 5.3600,
      lng: -4.0083,
      address: 'Pharmacie Centrale, Plateau'
    },
    status: 'completed',
    metadata: {
      deliveryTime: '3h 50min',
      temperatureLog: 'Maintenue 2-8°C',
      signature: 'Reçu par PHARM-123'
    }
  }
];

class TimelineService {
  private events: TimelineEvent[] = mockEvents;

  /**
   * Get all events with optional filtering
   */
  async getEvents(filters?: Partial<TimelineFilters>): Promise<TimelineEvent[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    let filteredEvents = [...this.events];

    if (filters) {
      // Filter by date range
      if (filters.dateRange) {
        filteredEvents = filteredEvents.filter(event => {
          const eventDate = new Date(event.timestamp);
          return eventDate >= filters.dateRange!.start && eventDate <= filters.dateRange!.end;
        });
      }

      // Filter by event types
      if (filters.eventTypes && filters.eventTypes.length > 0) {
        filteredEvents = filteredEvents.filter(event => 
          filters.eventTypes!.includes(event.type)
        );
      }

      // Filter by vehicle IDs
      if (filters.vehicleIds && filters.vehicleIds.length > 0) {
        filteredEvents = filteredEvents.filter(event => 
          filters.vehicleIds!.includes(event.vehicleId)
        );
      }

      // Filter by statuses
      if (filters.statuses && filters.statuses.length > 0) {
        filteredEvents = filteredEvents.filter(event => 
          filters.statuses!.includes(event.status)
        );
      }

      // Filter by severity
      if (filters.severity && filters.severity.length > 0) {
        filteredEvents = filteredEvents.filter(event => 
          event.severity && filters.severity!.includes(event.severity)
        );
      }
    }

    return filteredEvents.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  /**
   * Get a single event by ID
   */
  async getEventById(id: string): Promise<TimelineEvent | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.events.find(event => event.id === id) || null;
  }

  /**
   * Get available vehicles for filtering
   */
  async getAvailableVehicles(): Promise<string[]> {
    await new Promise(resolve => setTimeout(resolve, 100));
    const vehicles = [...new Set(this.events.map(event => event.vehicleId))];
    return vehicles.sort();
  }

  /**
   * Get events for a specific vehicle
   */
  async getEventsByVehicle(vehicleId: string): Promise<TimelineEvent[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return this.events
      .filter(event => event.vehicleId === vehicleId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  /**
   * Get related events for a specific event
   */
  async getRelatedEvents(eventId: string): Promise<TimelineEvent[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    const event = this.events.find(e => e.id === eventId);
    if (!event || !event.relatedEvents) return [];

    return this.events.filter(e => event.relatedEvents!.includes(e.id));
  }

  /**
   * Add a new event (for future use)
   */
  async addEvent(event: Omit<TimelineEvent, 'id'>): Promise<TimelineEvent> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const newEvent: TimelineEvent = {
      ...event,
      id: `evt_${Date.now()}`
    };

    this.events.push(newEvent);
    return newEvent;
  }

  /**
   * Update an existing event (for future use)
   */
  async updateEvent(id: string, updates: Partial<TimelineEvent>): Promise<TimelineEvent | null> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const index = this.events.findIndex(event => event.id === id);
    if (index === -1) return null;

    this.events[index] = { ...this.events[index], ...updates };
    return this.events[index];
  }

  /**
   * Delete an event (for future use)
   */
  async deleteEvent(id: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const index = this.events.findIndex(event => event.id === id);
    if (index === -1) return false;

    this.events.splice(index, 1);
    return true;
  }

  /**
   * Get event statistics
   */
  async getEventStats(): Promise<{
    total: number;
    byType: Record<string, number>;
    byStatus: Record<string, number>;
    bySeverity: Record<string, number>;
  }> {
    await new Promise(resolve => setTimeout(resolve, 100));

    const stats = {
      total: this.events.length,
      byType: {} as Record<string, number>,
      byStatus: {} as Record<string, number>,
      bySeverity: {} as Record<string, number>
    };

    this.events.forEach(event => {
      // Count by type
      stats.byType[event.type] = (stats.byType[event.type] || 0) + 1;
      
      // Count by status
      stats.byStatus[event.status] = (stats.byStatus[event.status] || 0) + 1;
      
      // Count by severity
      if (event.severity) {
        stats.bySeverity[event.severity] = (stats.bySeverity[event.severity] || 0) + 1;
      }
    });

    return stats;
  }
}

// Export singleton instance
export const timelineService = new TimelineService();
export { TimelineService };
