export interface TimelineEvent {
  id: string;
  timestamp: Date;
  type: 'departure' | 'arrival' | 'incident' | 'maintenance' | 'delay';
  title: string;
  description: string;
  vehicleId: string;
  driverId?: string;
  location?: {
    lat: number;
    lng: number;
    address: string;
  };
  status: 'completed' | 'in_progress' | 'cancelled' | 'delayed';
  severity?: 'low' | 'medium' | 'high' | 'critical';
  metadata?: Record<string, any>;
  relatedEvents?: string[];
}

export interface TimelineFilters {
  dateRange: {
    start: Date;
    end: Date;
  };
  eventTypes: TimelineEvent['type'][];
  vehicleIds: string[];
  statuses: TimelineEvent['status'][];
  severity?: TimelineEvent['severity'][];
}

export interface TimelineContainerProps {
  events: TimelineEvent[];
  loading?: boolean;
  onEventClick?: (event: TimelineEvent) => void;
  className?: string;
  height?: number;
}

export interface EventItemProps {
  event: TimelineEvent;
  onClick?: (event: TimelineEvent) => void;
  variant?: 'default' | 'compact' | 'detailed';
  showTime?: boolean;
  className?: string;
}

export interface DayDividerProps {
  date: Date;
  eventCount?: number;
  className?: string;
}

export interface EventDetailModalProps {
  event: TimelineEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (event: TimelineEvent) => void;
}

export interface TimelineFiltersProps {
  filters: TimelineFilters;
  onFiltersChange: (filters: TimelineFilters) => void;
  availableVehicles: string[];
  className?: string;
}
