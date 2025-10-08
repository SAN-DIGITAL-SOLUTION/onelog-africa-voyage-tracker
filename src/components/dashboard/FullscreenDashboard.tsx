import React, { useState, useEffect, useCallback } from 'react';
import { Maximize, Minimize, Filter, RefreshCw, Settings, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import MapComponent from '@/components/MapComponent';
import { useRealtimePositions } from '@/hooks/usePositions';
import { useMissions } from '@/hooks/useMissions';
import { useToast } from '@/hooks/use-toast';

interface DashboardConfig {
  autoRefresh: boolean;
  refreshInterval: number;
  showMap: boolean;
  showMissions: boolean;
  showKPIs: boolean;
  showAlerts: boolean;
  mapSize: 'small' | 'medium' | 'large' | 'fullscreen';
  theme: 'light' | 'dark' | 'auto';
}

interface FilterConfig {
  status: string[];
  priority: string[];
  clients: string[];
  vehicles: string[];
  dateRange: string;
}

export default function FullscreenDashboard() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  
  const [config, setConfig] = useState<DashboardConfig>({
    autoRefresh: true,
    refreshInterval: 30,
    showMap: true,
    showMissions: true,
    showKPIs: true,
    showAlerts: true,
    mapSize: 'large',
    theme: 'light'
  });

  const [filters, setFilters] = useState<FilterConfig>({
    status: ['active', 'in_progress'],
    priority: ['high', 'medium', 'low'],
    clients: [],
    vehicles: [],
    dateRange: 'today'
  });

  const { data: positions, isLoading: positionsLoading } = useRealtimePositions();
  const { data: missions, isLoading: missionsLoading, refetch: refetchMissions } = useMissions();
  const { toast } = useToast();

  // Gestion du mode plein écran
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(err => {
        console.error('Erreur plein écran:', err);
        toast({
          title: "Erreur",
          description: "Impossible d'activer le mode plein écran",
          variant: "destructive"
        });
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      });
    }
  }, [toast]);

  // Gestion des raccourcis clavier
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'F11') {
        event.preventDefault();
        toggleFullscreen();
      } else if (event.key === 'f' && event.ctrlKey) {
        event.preventDefault();
        setShowFilters(!showFilters);
      } else if (event.key === 's' && event.ctrlKey) {
        event.preventDefault();
        setShowSettings(!showSettings);
      } else if (event.key === 'r' && event.ctrlKey) {
        event.preventDefault();
        handleRefresh();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [showFilters, showSettings, toggleFullscreen]);

  // Auto-refresh
  useEffect(() => {
    if (!config.autoRefresh) return;

    const interval = setInterval(() => {
      refetchMissions();
      setLastUpdate(new Date());
    }, config.refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [config.autoRefresh, config.refreshInterval, refetchMissions]);

  // Gestion du changement de plein écran
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleRefresh = useCallback(() => {
    refetchMissions();
    setLastUpdate(new Date());
    toast({
      title: "Données actualisées",
      description: "Les informations ont été mises à jour",
    });
  }, [refetchMissions, toast]);

  const updateConfig = (key: keyof DashboardConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const updateFilter = (key: keyof FilterConfig, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Filtrage des missions
  const filteredMissions = missions?.filter(mission => {
    if (filters.status.length > 0 && !filters.status.includes(mission.status)) return false;
    if (filters.priority.length > 0 && !filters.priority.includes(mission.priority)) return false;
    if (filters.clients.length > 0 && !filters.clients.includes(mission.client_id)) return false;
    if (filters.vehicles.length > 0 && !filters.vehicles.includes(mission.vehicle_id)) return false;
    
    // Filtrage par date
    const missionDate = new Date(mission.created_at);
    const today = new Date();
    
    switch (filters.dateRange) {
      case 'today':
        return missionDate.toDateString() === today.toDateString();
      case 'week':
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        return missionDate >= weekAgo;
      case 'month':
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        return missionDate >= monthAgo;
      default:
        return true;
    }
  }) || [];

  // Calcul des KPIs
  const kpis = {
    totalMissions: filteredMissions.length,
    activeMissions: filteredMissions.filter(m => m.status === 'active').length,
    completedMissions: filteredMissions.filter(m => m.status === 'completed').length,
    delayedMissions: filteredMissions.filter(m => m.status === 'delayed').length,
    activeVehicles: positions?.length || 0,
    averageSpeed: positions?.reduce((acc, p) => acc + (p.speed || 0), 0) / (positions?.length || 1) || 0
  };

  const containerClass = isFullscreen 
    ? "fixed inset-0 z-50 bg-white overflow-hidden"
    : "w-full h-full min-h-screen bg-gray-50";

  const gridClass = isFullscreen
    ? "grid grid-cols-12 grid-rows-6 gap-4 h-screen p-4"
    : "grid grid-cols-1 lg:grid-cols-12 gap-4 p-4";

  return (
    <div className={containerClass}>
      {/* Header avec contrôles */}
      <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Dashboard Supervision - OneLog Africa
          </h1>
          <Badge variant="outline" className="text-xs">
            Dernière mise à jour: {lastUpdate.toLocaleTimeString()}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={showFilters ? "bg-blue-50 border-blue-200" : ""}
          >
            <Filter className="w-4 h-4 mr-1" />
            Filtres
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
            className={showSettings ? "bg-blue-50 border-blue-200" : ""}
          >
            <Settings className="w-4 h-4 mr-1" />
            Paramètres
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={positionsLoading || missionsLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-1 ${(positionsLoading || missionsLoading) ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>

          <Separator orientation="vertical" className="h-6" />

          <Button
            variant="outline"
            size="sm"
            onClick={toggleFullscreen}
          >
            {isFullscreen ? (
              <>
                <Minimize className="w-4 h-4 mr-1" />
                Quitter
              </>
            ) : (
              <>
                <Maximize className="w-4 h-4 mr-1" />
                Plein écran
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <div className={gridClass}>
          {/* Panneau de filtres */}
          {showFilters && (
            <Card className="col-span-12 lg:col-span-3">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Filtres Dynamiques
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Période</Label>
                  <Select value={filters.dateRange} onValueChange={(value) => updateFilter('dateRange', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="today">Aujourd'hui</SelectItem>
                      <SelectItem value="week">Cette semaine</SelectItem>
                      <SelectItem value="month">Ce mois</SelectItem>
                      <SelectItem value="all">Toutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium">Statut des missions</Label>
                  <div className="space-y-2 mt-2">
                    {['active', 'in_progress', 'completed', 'delayed'].map((status) => (
                      <div key={status} className="flex items-center space-x-2">
                        <Switch
                          id={`status-${status}`}
                          checked={filters.status.includes(status)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              updateFilter('status', [...filters.status, status]);
                            } else {
                              updateFilter('status', filters.status.filter(s => s !== status));
                            }
                          }}
                        />
                        <Label htmlFor={`status-${status}`} className="text-sm capitalize">
                          {status.replace('_', ' ')}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Priorité</Label>
                  <div className="space-y-2 mt-2">
                    {['high', 'medium', 'low'].map((priority) => (
                      <div key={priority} className="flex items-center space-x-2">
                        <Switch
                          id={`priority-${priority}`}
                          checked={filters.priority.includes(priority)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              updateFilter('priority', [...filters.priority, priority]);
                            } else {
                              updateFilter('priority', filters.priority.filter(p => p !== priority));
                            }
                          }}
                        />
                        <Label htmlFor={`priority-${priority}`} className="text-sm capitalize">
                          {priority}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Panneau de paramètres */}
          {showSettings && (
            <Card className="col-span-12 lg:col-span-3">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Paramètres d'Affichage
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-refresh" className="text-sm">Auto-actualisation</Label>
                  <Switch
                    id="auto-refresh"
                    checked={config.autoRefresh}
                    onCheckedChange={(checked) => updateConfig('autoRefresh', checked)}
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium">Intervalle (secondes)</Label>
                  <Select 
                    value={config.refreshInterval.toString()} 
                    onValueChange={(value) => updateConfig('refreshInterval', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10s</SelectItem>
                      <SelectItem value="30">30s</SelectItem>
                      <SelectItem value="60">1min</SelectItem>
                      <SelectItem value="300">5min</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium">Taille de la carte</Label>
                  <Select 
                    value={config.mapSize} 
                    onValueChange={(value) => updateConfig('mapSize', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Petite</SelectItem>
                      <SelectItem value="medium">Moyenne</SelectItem>
                      <SelectItem value="large">Grande</SelectItem>
                      <SelectItem value="fullscreen">Plein écran</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="space-y-3">
                  <Label className="text-sm font-medium">Modules visibles</Label>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-map" className="text-sm">Carte</Label>
                    <Switch
                      id="show-map"
                      checked={config.showMap}
                      onCheckedChange={(checked) => updateConfig('showMap', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-missions" className="text-sm">Missions</Label>
                    <Switch
                      id="show-missions"
                      checked={config.showMissions}
                      onCheckedChange={(checked) => updateConfig('showMissions', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-kpis" className="text-sm">KPIs</Label>
                    <Switch
                      id="show-kpis"
                      checked={config.showKPIs}
                      onCheckedChange={(checked) => updateConfig('showKPIs', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-alerts" className="text-sm">Alertes</Label>
                    <Switch
                      id="show-alerts"
                      checked={config.showAlerts}
                      onCheckedChange={(checked) => updateConfig('showAlerts', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Zone principale */}
          <div className={`${showFilters || showSettings ? 'col-span-12 lg:col-span-9' : 'col-span-12'} space-y-4`}>
            {/* KPIs */}
            {config.showKPIs && (
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-blue-600">{kpis.totalMissions}</div>
                    <div className="text-sm text-gray-600">Total Missions</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-green-600">{kpis.activeMissions}</div>
                    <div className="text-sm text-gray-600">En cours</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-gray-600">{kpis.completedMissions}</div>
                    <div className="text-sm text-gray-600">Terminées</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-red-600">{kpis.delayedMissions}</div>
                    <div className="text-sm text-gray-600">En retard</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-purple-600">{kpis.activeVehicles}</div>
                    <div className="text-sm text-gray-600">Véhicules actifs</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-orange-600">{Math.round(kpis.averageSpeed)}</div>
                    <div className="text-sm text-gray-600">Vitesse moy. (km/h)</div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Carte */}
            {config.showMap && (
              <Card className={`${config.mapSize === 'fullscreen' ? 'h-screen' : 'h-96'}`}>
                <CardContent className="p-0 h-full">
                  <MapComponent className="w-full h-full rounded-lg" />
                </CardContent>
              </Card>
            )}

            {/* Liste des missions */}
            {config.showMissions && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Missions Actives ({filteredMissions.length})
                    <Badge variant="outline">
                      {filters.dateRange === 'today' ? 'Aujourd\'hui' : 
                       filters.dateRange === 'week' ? 'Cette semaine' : 
                       filters.dateRange === 'month' ? 'Ce mois' : 'Toutes'}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {filteredMissions.map((mission) => (
                      <div key={mission.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Badge 
                            className={
                              mission.status === 'active' ? 'bg-green-100 text-green-800' :
                              mission.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                              mission.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                              'bg-red-100 text-red-800'
                            }
                          >
                            {mission.status}
                          </Badge>
                          <div>
                            <div className="font-medium">{mission.reference}</div>
                            <div className="text-sm text-gray-600">
                              {mission.pickup_location} → {mission.delivery_location}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{mission.client_name}</div>
                          <div className="text-xs text-gray-500">{mission.vehicle_plate}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Raccourcis clavier (visible uniquement en plein écran) */}
      {isFullscreen && (
        <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white p-3 rounded-lg text-xs">
          <div className="space-y-1">
            <div><kbd>F11</kbd> Plein écran</div>
            <div><kbd>Ctrl+F</kbd> Filtres</div>
            <div><kbd>Ctrl+S</kbd> Paramètres</div>
            <div><kbd>Ctrl+R</kbd> Actualiser</div>
          </div>
        </div>
      )}
    </div>
  );
}
