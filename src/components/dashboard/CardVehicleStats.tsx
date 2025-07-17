import React from 'react';
import { Card, Badge } from '../ui-system';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface VehicleStatsData {
  active: number;
  inactive: number;
  maintenance: number;
  total: number;
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
}

interface CardVehicleStatsProps {
  data?: VehicleStatsData;
  loading?: boolean;
  className?: string;
}

const mockData: VehicleStatsData = {
  active: 24,
  inactive: 3,
  maintenance: 2,
  total: 29,
  trend: 'up',
  trendValue: 12
};

export const CardVehicleStats: React.FC<CardVehicleStatsProps> = ({ 
  data = mockData, 
  loading = false,
  className = '' 
}) => {
  const getTrendIcon = () => {
    switch (data.trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-secondary-teal" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-accent-orange" />;
      default:
        return <Minus className="w-4 h-4 text-neutral-medium" />;
    }
  };

  const getTrendColor = () => {
    switch (data.trend) {
      case 'up':
        return 'text-secondary-teal';
      case 'down':
        return 'text-accent-orange';
      default:
        return 'text-neutral-medium';
    }
  };

  if (loading) {
    return (
      <Card className={`p-6 ${className}`} data-testid="card-vehicle-stats-loading">
        <div className="animate-pulse">
          <div className="h-4 bg-neutral-light rounded w-3/4 mb-4"></div>
          <div className="h-8 bg-neutral-light rounded w-1/2 mb-4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-neutral-light rounded w-full"></div>
            <div className="h-3 bg-neutral-light rounded w-5/6"></div>
            <div className="h-3 bg-neutral-light rounded w-4/6"></div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`p-6 ${className}`} data-testid="card-vehicle-stats">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-primary-dark">
          Flotte Véhicules
        </h3>
        <div className="flex items-center space-x-1">
          {getTrendIcon()}
          <span className={`text-sm font-medium ${getTrendColor()}`}>
            {data.trendValue}%
          </span>
        </div>
      </div>

      <div className="mb-6">
        <div className="text-3xl font-bold text-primary-dark mb-1">
          {data.total}
        </div>
        <p className="text-sm text-neutral-medium">
          Véhicules au total
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-secondary-teal"></div>
            <span className="text-sm text-neutral-dark">Actifs</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-primary-dark">
              {data.active}
            </span>
            <Badge variant="success" size="sm">
              {Math.round((data.active / data.total) * 100)}%
            </Badge>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-primary-yellow"></div>
            <span className="text-sm text-neutral-dark">Inactifs</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-primary-dark">
              {data.inactive}
            </span>
            <Badge variant="warning" size="sm">
              {Math.round((data.inactive / data.total) * 100)}%
            </Badge>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-accent-orange"></div>
            <span className="text-sm text-neutral-dark">Maintenance</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-primary-dark">
              {data.maintenance}
            </span>
            <Badge variant="error" size="sm">
              {Math.round((data.maintenance / data.total) * 100)}%
            </Badge>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-neutral-light">
        <p className="text-xs text-neutral-medium">
          Dernière mise à jour : {new Date().toLocaleTimeString('fr-FR')}
        </p>
      </div>
    </Card>
  );
};

export default CardVehicleStats;
