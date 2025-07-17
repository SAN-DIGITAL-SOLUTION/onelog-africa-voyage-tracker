import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const views = [
  { id: 'map', label: 'Vue Carte', icon: '🗺️' },
  { id: 'cards', label: 'Vue Synthèse', icon: '📊' },
  { id: 'timeline', label: 'Vue Timeline', icon: '⏳' }
];

export const NavigationSwitcher = () => {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = React.useState('map');

  const handleViewChange = (viewId: string) => {
    setCurrentView(viewId);
    navigate(`/prototype/${viewId}`);
  };

  return (
    <motion.div
      className="fixed top-4 left-4 z-50 bg-white p-2 rounded-lg shadow-lg"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div className="flex gap-2">
        {views.map((view) => (
          <motion.button
            key={view.id}
            onClick={() => handleViewChange(view.id)}
            className={`px-4 py-2 rounded-md transition-colors ${
              currentView === view.id
                ? 'bg-primary text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {view.icon} {view.label}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};
