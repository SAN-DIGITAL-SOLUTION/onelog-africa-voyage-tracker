import React from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar } from 'lucide-react';
import { DayDividerProps } from './types';

const DayDivider: React.FC<DayDividerProps> = ({
  date,
  eventCount,
  className = ''
}) => {
  const formatDayDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return "Aujourd'hui";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Hier";
    } else {
      return format(date, 'EEEE d MMMM yyyy', { locale: fr });
    }
  };

  return (
    <motion.div
      className={`day-divider relative flex items-center py-4 ${className}`}
      data-testid="day-divider"
      data-date={format(date, 'yyyy-MM-dd')}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Left line */}
      <div className="flex-1 h-px bg-neutral-medium"></div>
      
      {/* Date content */}
      <div className="px-4 py-2 bg-neutral-light rounded-full mx-4 flex items-center space-x-2 shadow-sm">
        <Calendar className="w-4 h-4 text-neutral-medium" />
        <div className="text-center">
          <span 
            className="text-sm font-medium text-neutral-dark capitalize"
            data-testid="day-date"
          >
            {formatDayDate(date)}
          </span>
          {eventCount !== undefined && (
            <span 
              className="ml-2 text-xs text-neutral-medium"
              data-testid="day-count"
            >
              {eventCount} événement{eventCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>
      
      {/* Right line */}
      <div className="flex-1 h-px bg-neutral-medium"></div>
      
      {/* Timeline marker overlay */}
      <div className="absolute left-8 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="w-4 h-4 bg-neutral-medium rounded-full border-2 border-white shadow-sm"></div>
      </div>
    </motion.div>
  );
};

export { DayDivider };
