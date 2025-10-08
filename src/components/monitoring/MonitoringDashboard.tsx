import React, { useState, useEffect } from 'react';
import { Activity, AlertTriangle, CheckCircle, Clock, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useMonitoring } from '@/utils/monitoring';

interface MetricCard {
  name: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  status: 'good' | 'warning' | 'critical';
}

export default function MonitoringDashboard() {
  const { getMetrics, getAlerts, getHealthStats, resolveAlert } = useMonitoring();
  const [healthStats, setHealthStats] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<MetricCard[]>([]);

  useEffect(() => {
    const updateData = () => {
      // Récupérer les statistiques de santé
      const stats = getHealthStats();
      setHealthStats(stats);

      // Récupérer les alertes actives
      const activeAlerts = getAlerts({ resolved: false });
      setAlerts(activeAlerts);

      // Calculer les métriques avec tendances
      const metricNames = ['responseTime', 'errorRate', 'memoryUsage', 'cpuUsage'];
      const calculatedMetrics: MetricCard[] = metricNames.map(name => {
        const recentData = getMetrics(name, 5 * 60 * 1000); // 5 minutes
        const olderData = getMetrics(name, 10 * 60 * 1000).slice(0, -recentData.length);

        const currentValue = recentData.length > 0 
          ? recentData.reduce((sum, m) => sum + m.value, 0) / recentData.length 
          : 0;

        const previousValue = olderData.length > 0 
          ? olderData.reduce((sum, m) => sum + m.value, 0) / olderData.length 
          : currentValue;

        let trend: 'up' | 'down' | 'stable' = 'stable';
        if (currentValue > previousValue * 1.1) trend = 'up';
        else if (currentValue < previousValue * 0.9) trend = 'down';

        let status: 'good' | 'warning' | 'critical' = 'good';
        if (name === 'responseTime' && currentValue > 2000) status = 'critical';
        else if (name === 'errorRate' && currentValue > 0.05) status = 'critical';
        else if ((name === 'memoryUsage' || name === 'cpuUsage') && currentValue > 0.8) status = 'critical';
        else if (currentValue > 0.7) status = 'warning';

        return {
          name,
          value: currentValue,
          unit: getMetricUnit(name),
          trend,
          status
        };
      });

      setMetrics(calculatedMetrics);
    };

    updateData();
    const interval = setInterval(updateData, 30000); // Mise à jour toutes les 30 secondes

    return () => clearInterval(interval);
  }, [getMetrics, getAlerts, getHealthStats]);

  const getMetricUnit = (name: string): string => {
    switch (name) {
      case 'responseTime': return 'ms';
      case 'errorRate': return '%';
      case 'memoryUsage':
      case 'cpuUsage': return '%';
      default: return '';
    }
  };

  const getMetricDisplayName = (name: string): string => {
    switch (name) {
      case 'responseTime': return 'Temps de réponse';
      case 'errorRate': return 'Taux d\'erreur';
      case 'memoryUsage': return 'Utilisation mémoire';
      case 'cpuUsage': return 'Utilisation CPU';
      default: return name;
    }
  };

  const formatMetricValue = (value: number, unit: string): string => {
    if (unit === '%') {
      return `${(value * 100).toFixed(1)}%`;
    }
    if (unit === 'ms') {
      return `${Math.round(value)}ms`;
    }
    return value.toFixed(2);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      case 'good': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-blue-100 text-blue-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleResolveAlert = (alertId: string) => {
    if (resolveAlert(alertId)) {
      setAlerts(prev => prev.filter(alert => alert.id !== alertId));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header avec statut global */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Activity className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Monitoring Système</h1>
        </div>
        
        {healthStats && (
          <Badge className={getStatusColor(healthStats.status)}>
            <div className="flex items-center gap-2">
              {healthStats.status === 'healthy' ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <AlertTriangle className="w-4 h-4" />
              )}
              {healthStats.status === 'healthy' ? 'Système sain' : 
               healthStats.status === 'warning' ? 'Attention requise' : 'Problème critique'}
            </div>
          </Badge>
        )}
      </div>

      {/* Alertes critiques */}
      {alerts.filter(a => a.severity === 'critical').length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {alerts.filter(a => a.severity === 'critical').length} alerte(s) critique(s) nécessitent une attention immédiate.
          </AlertDescription>
        </Alert>
      )}

      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <Card key={metric.name}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">
                  {getMetricDisplayName(metric.name)}
                </span>
                <div className="flex items-center gap-1">
                  {metric.trend === 'up' ? (
                    <TrendingUp className={`w-4 h-4 ${metric.status === 'good' ? 'text-green-500' : 'text-red-500'}`} />
                  ) : metric.trend === 'down' ? (
                    <TrendingDown className={`w-4 h-4 ${metric.status === 'good' ? 'text-red-500' : 'text-green-500'}`} />
                  ) : (
                    <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
                  )}
                </div>
              </div>
              
              <div className={`text-2xl font-bold ${getStatusColor(metric.status)}`}>
                {formatMetricValue(metric.value, metric.unit)}
              </div>
              
              <div className="mt-1">
                <Badge variant="outline" className={`text-xs ${getStatusColor(metric.status)}`}>
                  {metric.status === 'good' ? 'Normal' : 
                   metric.status === 'warning' ? 'Attention' : 'Critique'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Statistiques détaillées */}
      {healthStats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Alertes Actives</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">
                {healthStats.activeAlerts}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                dont {healthStats.criticalAlerts} critiques
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Temps de fonctionnement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                99.9%
              </div>
              <div className="text-sm text-gray-600 mt-1">
                Dernières 24h
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Dernière vérification</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {new Date().toLocaleTimeString('fr-FR')}
                </span>
              </div>
              <div className="text-sm text-gray-500 mt-1">
                Mise à jour automatique
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Liste des alertes */}
      <Card>
        <CardHeader>
          <CardTitle>Alertes Récentes ({alerts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {alerts.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
              Aucune alerte active
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.slice(0, 10).map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge className={getSeverityColor(alert.severity)}>
                      {alert.severity}
                    </Badge>
                    <div>
                      <div className="font-medium text-sm">{alert.message}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(alert.timestamp).toLocaleString('fr-FR')}
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleResolveAlert(alert.id)}
                  >
                    Résoudre
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Graphiques de tendances (placeholder) */}
      <Card>
        <CardHeader>
          <CardTitle>Tendances des Performances</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <TrendingUp className="w-12 h-12 mx-auto mb-2" />
              <p>Graphiques de tendances disponibles prochainement</p>
              <p className="text-sm">Intégration avec Chart.js ou Recharts</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
