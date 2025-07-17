import React from 'react';
import { Card } from '../ui-system';

interface DashboardGridProps {
  className?: string;
}

export const DashboardGrid: React.FC<DashboardGridProps> = ({ className = '' }) => {
  return (
    <div 
      className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 ${className}`}
      data-testid="dashboard-grid"
    >
      {/* Placeholder cards for MVP structure */}
      <Card className="p-4" data-testid="dashboard-card-placeholder">
        <h3 className="text-lg font-semibold text-primary-dark mb-2">
          Véhicules Actifs
        </h3>
        <div className="text-3xl font-bold text-accent-orange">
          --
        </div>
        <p className="text-sm text-neutral-medium mt-1">
          En temps réel
        </p>
      </Card>

      <Card className="p-4" data-testid="dashboard-card-placeholder">
        <h3 className="text-lg font-semibold text-primary-dark mb-2">
          Retards
        </h3>
        <div className="text-3xl font-bold text-accent-orange">
          --
        </div>
        <p className="text-sm text-neutral-medium mt-1">
          Aujourd'hui
        </p>
      </Card>

      <Card className="p-4" data-testid="dashboard-card-placeholder">
        <h3 className="text-lg font-semibold text-primary-dark mb-2">
          Maintenance
        </h3>
        <div className="text-3xl font-bold text-accent-orange">
          --
        </div>
        <p className="text-sm text-neutral-medium mt-1">
          Programmée
        </p>
      </Card>
    </div>
  );
};

export default DashboardGrid;
