import { TimelineEvent } from '@/types/timeline';

export const mockTimelineEvents: TimelineEvent[] = [
  {
    id: '1',
    timestamp: new Date('2025-07-15T08:30:00'),
    type: 'departure',
    title: 'Départ de l\'entrepôt principal',
    description: 'Chargement des marchandises terminé',
    vehicleId: 'VAN-001',
    vehicleName: 'Camion Renault Master',
    driverId: 'DRV-001',
    driverName: 'Jean Dupont',
    status: 'completed',
    severity: 'low',
    location: {
      latitude: 48.8566,
      longitude: 2.3522,
      address: '123 Rue de Paris, 75001 Paris'
    }
  },
  {
    id: '2',
    timestamp: new Date('2025-07-15T10:15:00'),
    type: 'incident',
    title: 'Trafic important',
    description: 'Bouchon sur le périphérique',
    vehicleId: 'VAN-001',
    vehicleName: 'Camion Renault Master',
    status: 'resolved',
    severity: 'medium',
    location: {
      latitude: 48.8362,
      longitude: 2.3959,
      address: 'Périphérique intérieur, Paris'
    }
  },
  {
    id: '3',
    timestamp: new Date('2025-07-15T12:45:00'),
    type: 'arrival',
    title: 'Arrivée sur le site client',
    description: 'Client: ABC Entreprise',
    vehicleId: 'VAN-001',
    vehicleName: 'Camion Renault Master',
    status: 'completed',
    severity: 'low',
    location: {
      latitude: 48.8738,
      longitude: 2.2950,
      address: '42 Avenue des Champs-Élysées, 75008 Paris'
    }
  },
  {
    id: '4',
    timestamp: new Date('2025-07-16T09:15:00'),
    type: 'maintenance',
    title: 'Véhicule en maintenance',
    description: 'Révision annuelle',
    vehicleId: 'VAN-001',
    vehicleName: 'Camion Renault Master',
    status: 'in_progress',
    severity: 'high',
    location: {
      latitude: 48.8566,
      longitude: 2.3522,
      address: 'Atelier principal, 123 Rue de Paris, 75001 Paris'
    }
  }
];

export const mockTimelineFilters = {
  dateRange: {
    start: new Date('2025-07-15'),
    end: new Date('2025-07-17')
  },
  types: ['departure', 'arrival', 'incident', 'maintenance'],
  status: ['completed', 'in_progress', 'pending'],
  severity: ['low', 'medium', 'high'],
  vehicleId: 'VAN-001'
};
