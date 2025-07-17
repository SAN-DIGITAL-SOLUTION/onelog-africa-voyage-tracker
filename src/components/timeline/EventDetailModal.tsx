import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  X, 
  Truck, 
  MapPin, 
  AlertTriangle, 
  Wrench, 
  Clock,
  User,
  Navigation,
  Calendar,
  Edit,
  Trash2,
  Download
} from 'lucide-react';
import { Badge, Button } from '../ui-system';
import { EventDetailModalProps } from './types';

const EventDetailModal: React.FC<EventDetailModalProps> = ({
  event,
  isOpen,
  onClose,
  onEdit
}) => {
  if (!event) return null;

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

  const formatDateTime = (timestamp: Date) => {
    return format(timestamp, 'EEEE d MMMM yyyy à HH:mm', { locale: fr });
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(event);
    }
  };

  const handleExport = () => {
    // Export event data as JSON
    const dataStr = JSON.stringify(event, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `event-${event.id}-${format(new Date(event.timestamp), 'yyyy-MM-dd')}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            data-testid="modal-backdrop"
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <div 
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
              data-testid="event-detail-modal"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-neutral-light">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full ${config.bgColor} flex items-center justify-center`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-neutral-dark" data-testid="modal-title">
                      {event.title}
                    </h2>
                    <p className={`text-sm font-medium ${config.textColor}`}>
                      {config.label}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Badge 
                    text={event.status} 
                    color={statusVariants[event.status]}
                  />
                  {event.severity && (
                    <span className={`text-xs font-medium ${severityColors[event.severity]}`}>
                      {event.severity.toUpperCase()}
                    </span>
                  )}
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-neutral-light rounded-full transition-colors"
                    data-testid="modal-close"
                  >
                    <X className="w-5 h-5 text-neutral-medium" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                {/* Timestamp */}
                <div className="mb-6">
                  <div className="flex items-center space-x-2 text-neutral-medium mb-2">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm font-medium">Date et heure</span>
                  </div>
                  <p className="text-neutral-dark font-medium" data-testid="modal-timestamp">
                    {formatDateTime(new Date(event.timestamp))}
                  </p>
                </div>

                {/* Description */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-neutral-medium mb-2">Description</h3>
                  <p className="text-neutral-dark" data-testid="modal-description">
                    {event.description}
                  </p>
                </div>

                {/* Vehicle and Driver */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <div className="flex items-center space-x-2 text-neutral-medium mb-2">
                      <Truck className="w-4 h-4" />
                      <span className="text-sm font-medium">Véhicule</span>
                    </div>
                    <p className="text-neutral-dark font-medium" data-testid="modal-vehicle">
                      {event.vehicleId}
                    </p>
                  </div>

                  {event.driverId && (
                    <div>
                      <div className="flex items-center space-x-2 text-neutral-medium mb-2">
                        <User className="w-4 h-4" />
                        <span className="text-sm font-medium">Conducteur</span>
                      </div>
                      <p className="text-neutral-dark font-medium" data-testid="modal-driver">
                        {event.driverId}
                      </p>
                    </div>
                  )}
                </div>

                {/* Location */}
                {event.location && (
                  <div className="mb-6">
                    <div className="flex items-center space-x-2 text-neutral-medium mb-2">
                      <Navigation className="w-4 h-4" />
                      <span className="text-sm font-medium">Localisation</span>
                    </div>
                    <div className="bg-neutral-light rounded-lg p-3">
                      <p className="text-neutral-dark font-medium mb-1" data-testid="modal-address">
                        {event.location.address || 'Adresse non disponible'}
                      </p>
                      <p className="text-sm text-neutral-medium" data-testid="modal-coordinates">
                        {event.location.lat.toFixed(6)}, {event.location.lng.toFixed(6)}
                      </p>
                    </div>
                  </div>
                )}

                {/* Metadata */}
                {event.metadata && Object.keys(event.metadata).length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-neutral-medium mb-2">Informations supplémentaires</h3>
                    <div className="bg-neutral-light rounded-lg p-3">
                      {Object.entries(event.metadata).map(([key, value]) => (
                        <div key={key} className="flex justify-between py-1">
                          <span className="text-sm text-neutral-medium capitalize">{key}:</span>
                          <span className="text-sm text-neutral-dark">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Related Events */}
                {event.relatedEvents && event.relatedEvents.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-neutral-medium mb-2">
                      Événements liés ({event.relatedEvents.length})
                    </h3>
                    <div className="space-y-2">
                      {event.relatedEvents.map((relatedId) => (
                        <div 
                          key={relatedId}
                          className="flex items-center justify-between p-2 bg-neutral-light rounded"
                        >
                          <span className="text-sm text-neutral-dark">{relatedId}</span>
                          <button className="text-xs text-primary-dark hover:underline">
                            Voir détails
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between p-6 border-t border-neutral-light bg-neutral-light">
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExport}
                    data-testid="modal-export"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Exporter
                  </Button>
                </div>

                <div className="flex space-x-2">
                  {onEdit && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleEdit}
                      data-testid="modal-edit"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Modifier
                    </Button>
                  )}
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={onClose}
                    data-testid="modal-close-button"
                  >
                    Fermer
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export { EventDetailModal };
