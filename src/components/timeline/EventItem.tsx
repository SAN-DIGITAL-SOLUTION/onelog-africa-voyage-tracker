import React from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  Truck, 
  MapPin, 
  AlertTriangle, 
  Wrench, 
  Clock,
  User,
  Navigation
} from 'lucide-react';
import { Badge } from '../ui-system';
import { TimelineEvent, EventItemProps } from './types';

const EventItem: React.FC<EventItemProps> = ({
  event,
  onClick,
  variant = 'default',
  showTime = true,
  className = ''
}) => {
  // Event type configuration
  const eventConfig = {
    departure: {
      icon: Truck,
      color: 'primary',
      bgColor: 'bg-primary-dark',
      textColor: 'text-primary-dark',
      label: 'Départ'
    },
    arrival: {
      icon: MapPin,
      color: 'success',
      bgColor: 'bg-secondary-teal',
      textColor: 'text-secondary-teal',
      label: 'Arrivée'
    },
    incident: {
      icon: AlertTriangle,
      color: 'warning',
      bgColor: 'bg-primary-yellow',
      textColor: 'text-primary-yellow',
      label: 'Incident'
    },
    maintenance: {
      icon: Wrench,
      color: 'error',
      bgColor: 'bg-accent-orange',
      textColor: 'text-accent-orange',
      label: 'Maintenance'
    },
    delay: {
      icon: Clock,
      color: 'warning',
      bgColor: 'bg-accent-orange',
      textColor: 'text-accent-orange',
      label: 'Retard'
    }
  };

  const config = eventConfig[event.type];
  const Icon = config.icon;

  // Status badge variant mapping
  const statusVariants = {
    completed: 'success',
    in_progress: 'secondary',
    cancelled: 'error',
    delayed: 'warning'
  } as const;

  // Severity color mapping
  const severityColors = {
    low: 'text-secondary-teal',
    medium: 'text-primary-yellow',
    high: 'text-accent-orange',
    critical: 'text-red-600'
  };

  const handleClick = () => {
    if (onClick) {
      onClick(event);
    }
  };

  const formatEventTime = (timestamp: Date) => {
    return format(timestamp, 'HH:mm', { locale: fr });
  };

  const formatEventDate = (timestamp: Date) => {
    return format(timestamp, 'dd MMM', { locale: fr });
  };

  return (
    <motion.div
      className={`event-item relative pl-16 pr-4 py-4 cursor-pointer ${className}`}
      data-testid="event-item"
      data-event-id={event.id}
      data-event-type={event.type}
      onClick={handleClick}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      variants={{
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0 }
      }}
    >
      {/* Timeline marker */}
      <div className="absolute left-6 top-6 transform -translate-x-1/2">
        <div className={`w-8 h-8 rounded-full ${config.bgColor} flex items-center justify-center shadow-md`}>
          <Icon className="w-4 h-4 text-white" data-testid="event-icon" />
        </div>
      </div>

      {/* Event content */}
      <div className="bg-white rounded-lg shadow-sm border border-neutral-light p-4 ml-4 hover:shadow-md transition-shadow">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h4 className="font-medium text-neutral-dark mb-1" data-testid="event-title">
              {event.title}
            </h4>
            {showTime && (
              <div className="flex items-center text-sm text-neutral-medium space-x-2">
                <span data-testid="event-time">
                  {formatEventTime(new Date(event.timestamp))}
                </span>
                <span>•</span>
                <span data-testid="event-date">
                  {formatEventDate(new Date(event.timestamp))}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge 
              text={event.status} 
              color={statusVariants[event.status]} 
              data-testid="event-status"
            />
            {event.severity && (
              <span 
                className={`text-xs font-medium ${severityColors[event.severity]}`}
                data-testid="event-severity"
              >
                {event.severity.toUpperCase()}
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        {variant !== 'compact' && (
          <p className="text-sm text-neutral-medium mb-3" data-testid="event-description">
            {event.description}
          </p>
        )}

        {/* Metadata */}
        <div className="flex items-center justify-between text-xs text-neutral-medium">
          <div className="flex items-center space-x-4">
            {/* Vehicle */}
            <div className="flex items-center space-x-1">
              <Truck className="w-3 h-3" />
              <span data-testid="event-vehicle">{event.vehicleId}</span>
            </div>

            {/* Driver */}
            {event.driverId && (
              <div className="flex items-center space-x-1">
                <User className="w-3 h-3" />
                <span data-testid="event-driver">{event.driverId}</span>
              </div>
            )}

            {/* Location */}
            {event.location && (
              <div className="flex items-center space-x-1">
                <Navigation className="w-3 h-3" />
                <span data-testid="event-location">
                  {event.location.address || `${event.location.lat}, ${event.location.lng}`}
                </span>
              </div>
            )}
          </div>

          {/* Event type label */}
          <span className={`font-medium ${config.textColor}`} data-testid="event-type-label">
            {config.label}
          </span>
        </div>

        {/* Related events indicator */}
        {event.relatedEvents && event.relatedEvents.length > 0 && (
          <div className="mt-2 pt-2 border-t border-neutral-light">
            <span className="text-xs text-neutral-medium">
              {event.relatedEvents.length} événement(s) lié(s)
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export { EventItem };
export type { TimelineEvent } from './types';
