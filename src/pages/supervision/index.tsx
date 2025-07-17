import React, { useState } from 'react';
import { Layout } from '@/components/ui-system';
import MapView from '@/components/supervision/MapView';
import SidebarFilters from '@/components/supervision/SidebarFilters';

interface SupervisionFilters {
  status: string[];
  zone: string[];
  driver: string[];
}

const SupervisionPage: React.FC = () => {
  const [filters, setFilters] = useState<SupervisionFilters>({
    status: [],
    zone: [],
    driver: [],
  });

  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleFiltersChange = (newFilters: SupervisionFilters) => {
    setFilters(newFilters);
  };

  const handleMarkerClick = (vehicle: any) => {
    console.log('Vehicle clicked:', vehicle);
    // Ici on pourrait ouvrir un modal détaillé ou naviguer vers une page de détail
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <Layout showHeader={!isFullscreen} className="h-screen overflow-hidden">
      <div className="flex h-full">
        {/* Sidebar Filters */}
        {!isFullscreen && (
          <div className="w-80 flex-shrink-0 p-4 bg-[#F4F4F4] border-r border-[#1A3C40]/10">
            <SidebarFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              data-testid="sidebar-filters"
            />
          </div>
        )}

        {/* Main Map Area */}
        <div className="flex-1 p-4 bg-[#F4F4F4]">
          <div className="h-full">
            <MapView
              filters={filters}
              onMarkerClick={handleMarkerClick}
              fullscreen={isFullscreen}
              onToggleFullscreen={toggleFullscreen}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SupervisionPage;
