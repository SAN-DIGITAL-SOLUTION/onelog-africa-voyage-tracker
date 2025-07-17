import React from 'react';
import { Card } from '../ui-system';
import { LucideIcon } from 'lucide-react';

interface StatWidgetProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'stable';
    label?: string;
  };
  color?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error';
  loading?: boolean;
  className?: string;
}

const colorClasses = {
  primary: {
    icon: 'text-primary-dark',
    value: 'text-primary-dark',
    trend: {
      up: 'text-secondary-teal',
      down: 'text-accent-orange',
      stable: 'text-neutral-medium'
    }
  },
  secondary: {
    icon: 'text-secondary-teal',
    value: 'text-secondary-teal',
    trend: {
      up: 'text-secondary-teal',
      down: 'text-accent-orange',
      stable: 'text-neutral-medium'
    }
  },
  accent: {
    icon: 'text-accent-orange',
    value: 'text-accent-orange',
    trend: {
      up: 'text-secondary-teal',
      down: 'text-accent-orange',
      stable: 'text-neutral-medium'
    }
  },
  success: {
    icon: 'text-secondary-teal',
    value: 'text-secondary-teal',
    trend: {
      up: 'text-secondary-teal',
      down: 'text-accent-orange',
      stable: 'text-neutral-medium'
    }
  },
  warning: {
    icon: 'text-primary-yellow',
    value: 'text-primary-yellow',
    trend: {
      up: 'text-secondary-teal',
      down: 'text-accent-orange',
      stable: 'text-neutral-medium'
    }
  },
  error: {
    icon: 'text-accent-orange',
    value: 'text-accent-orange',
    trend: {
      up: 'text-secondary-teal',
      down: 'text-accent-orange',
      stable: 'text-neutral-medium'
    }
  }
};

export const StatWidget: React.FC<StatWidgetProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'primary',
  loading = false,
  className = ''
}) => {
  const colors = colorClasses[color];

  if (loading) {
    return (
      <Card className={`p-6 ${className}`} data-testid="stat-widget-loading">
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="h-4 bg-neutral-light rounded w-1/2"></div>
            {Icon && <div className="w-5 h-5 bg-neutral-light rounded"></div>}
          </div>
          <div className="h-8 bg-neutral-light rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-neutral-light rounded w-1/2"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`p-6 ${className}`} data-testid="stat-widget">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-neutral-dark">
          {title}
        </h3>
        {Icon && (
          <Icon 
            className={`w-5 h-5 ${colors.icon}`}
            data-testid="stat-widget-icon"
          />
        )}
      </div>

      <div className="mb-2">
        <div 
          className={`text-3xl font-bold ${colors.value}`}
          data-testid="stat-widget-value"
        >
          {value}
        </div>
      </div>

      <div className="flex items-center justify-between">
        {subtitle && (
          <p className="text-sm text-neutral-medium">
            {subtitle}
          </p>
        )}
        
        {trend && (
          <div 
            className={`flex items-center space-x-1 text-sm font-medium ${colors.trend[trend.direction]}`}
            data-testid="stat-widget-trend"
          >
            <span>
              {trend.direction === 'up' ? '↗' : trend.direction === 'down' ? '↘' : '→'}
            </span>
            <span>{Math.abs(trend.value)}%</span>
            {trend.label && (
              <span className="text-xs text-neutral-medium ml-1">
                {trend.label}
              </span>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default StatWidget;
