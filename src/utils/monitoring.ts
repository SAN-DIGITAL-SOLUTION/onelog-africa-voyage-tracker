// Système de monitoring et alertes pour OneLog Africa
// Surveillance en temps réel des performances et sécurité

interface MetricData {
  timestamp: number;
  value: number;
  labels?: Record<string, string>;
}

interface Alert {
  id: string;
  type: 'performance' | 'security' | 'business' | 'system';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: number;
  resolved?: boolean;
  metadata?: Record<string, any>;
}

class MonitoringService {
  private metrics: Map<string, MetricData[]> = new Map();
  private alerts: Alert[] = [];
  private thresholds: Record<string, number> = {
    responseTime: 2000, // 2 secondes
    errorRate: 0.05, // 5%
    memoryUsage: 0.8, // 80%
    cpuUsage: 0.7, // 70%
    failedLogins: 5,
    rateLimitExceeded: 10
  };

  // Collecter une métrique
  collectMetric(name: string, value: number, labels?: Record<string, string>): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    const metrics = this.metrics.get(name)!;
    metrics.push({
      timestamp: Date.now(),
      value,
      labels
    });

    // Garder seulement les 1000 dernières métriques
    if (metrics.length > 1000) {
      metrics.shift();
    }

    // Vérifier les seuils d'alerte
    this.checkThresholds(name, value);
  }

  // Vérifier les seuils et créer des alertes
  private checkThresholds(metricName: string, value: number): void {
    const threshold = this.thresholds[metricName];
    if (!threshold) return;

    let shouldAlert = false;
    let severity: Alert['severity'] = 'low';

    switch (metricName) {
      case 'responseTime':
        shouldAlert = value > threshold;
        severity = value > threshold * 2 ? 'critical' : 'high';
        break;
      case 'errorRate':
        shouldAlert = value > threshold;
        severity = value > threshold * 2 ? 'critical' : 'high';
        break;
      case 'memoryUsage':
      case 'cpuUsage':
        shouldAlert = value > threshold;
        severity = value > 0.9 ? 'critical' : 'high';
        break;
      case 'failedLogins':
      case 'rateLimitExceeded':
        shouldAlert = value >= threshold;
        severity = value >= threshold * 2 ? 'critical' : 'medium';
        break;
    }

    if (shouldAlert) {
      this.createAlert({
        type: metricName.includes('Login') || metricName.includes('rate') ? 'security' : 'performance',
        severity,
        message: `${metricName} a dépassé le seuil: ${value} > ${threshold}`,
        metadata: { metricName, value, threshold }
      });
    }
  }

  // Créer une alerte
  createAlert(alert: Omit<Alert, 'id' | 'timestamp'>): void {
    const newAlert: Alert = {
      ...alert,
      id: crypto.randomUUID(),
      timestamp: Date.now()
    };

    this.alerts.push(newAlert);
    
    // Notifier immédiatement les alertes critiques
    if (alert.severity === 'critical') {
      this.sendCriticalAlert(newAlert);
    }

    console.warn('Alert created:', newAlert);
  }

  // Envoyer une alerte critique
  private async sendCriticalAlert(alert: Alert): Promise<void> {
    try {
      // En production, envoyer via Slack, email, SMS, etc.
      if (process.env.NODE_ENV === 'production') {
        await this.sendSlackAlert(alert);
        await this.sendEmailAlert(alert);
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi d\'alerte critique:', error);
    }
  }

  // Envoyer alerte Slack (placeholder)
  private async sendSlackAlert(alert: Alert): Promise<void> {
    const webhookUrl = process.env.SLACK_WEBHOOK_URL;
    if (!webhookUrl) return;

    const payload = {
      text: `🚨 Alerte Critique OneLog Africa`,
      attachments: [{
        color: 'danger',
        fields: [
          { title: 'Type', value: alert.type, short: true },
          { title: 'Sévérité', value: alert.severity, short: true },
          { title: 'Message', value: alert.message, short: false },
          { title: 'Timestamp', value: new Date(alert.timestamp).toISOString(), short: true }
        ]
      }]
    };

    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  }

  // Envoyer alerte email (placeholder)
  private async sendEmailAlert(alert: Alert): Promise<void> {
    // Implémentation avec service email (SendGrid, etc.)
    console.log('Email alert would be sent:', alert);
  }

  // Obtenir les métriques
  getMetrics(name: string, timeRange?: number): MetricData[] {
    const metrics = this.metrics.get(name) || [];
    
    if (timeRange) {
      const cutoff = Date.now() - timeRange;
      return metrics.filter(m => m.timestamp > cutoff);
    }
    
    return metrics;
  }

  // Obtenir les alertes
  getAlerts(filters?: { 
    type?: Alert['type']; 
    severity?: Alert['severity']; 
    resolved?: boolean;
    timeRange?: number;
  }): Alert[] {
    let filteredAlerts = [...this.alerts];

    if (filters) {
      if (filters.type) {
        filteredAlerts = filteredAlerts.filter(a => a.type === filters.type);
      }
      if (filters.severity) {
        filteredAlerts = filteredAlerts.filter(a => a.severity === filters.severity);
      }
      if (filters.resolved !== undefined) {
        filteredAlerts = filteredAlerts.filter(a => !!a.resolved === filters.resolved);
      }
      if (filters.timeRange) {
        const cutoff = Date.now() - filters.timeRange;
        filteredAlerts = filteredAlerts.filter(a => a.timestamp > cutoff);
      }
    }

    return filteredAlerts.sort((a, b) => b.timestamp - a.timestamp);
  }

  // Résoudre une alerte
  resolveAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      return true;
    }
    return false;
  }

  // Obtenir les statistiques de santé du système
  getHealthStats(): {
    status: 'healthy' | 'warning' | 'critical';
    metrics: Record<string, number>;
    activeAlerts: number;
    criticalAlerts: number;
  } {
    const now = Date.now();
    const last5Min = 5 * 60 * 1000;

    // Calculer les métriques récentes
    const recentMetrics: Record<string, number> = {};
    
    for (const [name, metrics] of this.metrics.entries()) {
      const recent = metrics.filter(m => now - m.timestamp < last5Min);
      if (recent.length > 0) {
        recentMetrics[name] = recent.reduce((sum, m) => sum + m.value, 0) / recent.length;
      }
    }

    // Compter les alertes actives
    const activeAlerts = this.alerts.filter(a => !a.resolved);
    const criticalAlerts = activeAlerts.filter(a => a.severity === 'critical');

    // Déterminer le statut global
    let status: 'healthy' | 'warning' | 'critical' = 'healthy';
    
    if (criticalAlerts.length > 0) {
      status = 'critical';
    } else if (activeAlerts.length > 0) {
      status = 'warning';
    }

    return {
      status,
      metrics: recentMetrics,
      activeAlerts: activeAlerts.length,
      criticalAlerts: criticalAlerts.length
    };
  }

  // Nettoyer les anciennes données
  cleanup(maxAge: number = 24 * 60 * 60 * 1000): void {
    const cutoff = Date.now() - maxAge;

    // Nettoyer les métriques
    for (const [name, metrics] of this.metrics.entries()) {
      const filtered = metrics.filter(m => m.timestamp > cutoff);
      this.metrics.set(name, filtered);
    }

    // Nettoyer les alertes résolues anciennes
    this.alerts = this.alerts.filter(a => 
      !a.resolved || a.timestamp > cutoff
    );
  }
}

// Instance singleton
export const monitoring = new MonitoringService();

// Hooks pour React
export const useMonitoring = () => {
  return {
    collectMetric: monitoring.collectMetric.bind(monitoring),
    createAlert: monitoring.createAlert.bind(monitoring),
    getMetrics: monitoring.getMetrics.bind(monitoring),
    getAlerts: monitoring.getAlerts.bind(monitoring),
    getHealthStats: monitoring.getHealthStats.bind(monitoring),
    resolveAlert: monitoring.resolveAlert.bind(monitoring)
  };
};

// Middleware pour Express
export const monitoringMiddleware = (req: any, res: any, next: any) => {
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    
    // Collecter les métriques de performance
    monitoring.collectMetric('responseTime', duration, {
      method: req.method,
      route: req.route?.path || req.path,
      statusCode: res.statusCode.toString()
    });

    // Collecter les métriques d'erreur
    if (res.statusCode >= 400) {
      monitoring.collectMetric('errorRate', 1, {
        statusCode: res.statusCode.toString(),
        route: req.route?.path || req.path
      });
    }

    // Alertes spécifiques
    if (res.statusCode === 401) {
      monitoring.collectMetric('failedLogins', 1, {
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
    }

    if (res.statusCode === 429) {
      monitoring.collectMetric('rateLimitExceeded', 1, {
        ip: req.ip,
        route: req.route?.path || req.path
      });
    }
  });

  next();
};

// Collecteur de métriques système (Node.js)
export const startSystemMetricsCollection = () => {
  if (typeof process === 'undefined') return; // Pas côté client

  setInterval(() => {
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    // Métriques mémoire
    monitoring.collectMetric('memoryUsage', memUsage.heapUsed / memUsage.heapTotal);
    monitoring.collectMetric('memoryTotal', memUsage.heapTotal);

    // Métriques CPU (approximation)
    const totalCpuTime = cpuUsage.user + cpuUsage.system;
    monitoring.collectMetric('cpuUsage', totalCpuTime / 1000000); // Convertir en secondes
  }, 30000); // Toutes les 30 secondes
};

// Collecteur de métriques Web Vitals (côté client)
export const collectWebVitals = () => {
  if (typeof window === 'undefined') return;

  // Performance Observer pour les métriques Web Vitals
  if ('PerformanceObserver' in window) {
    // Largest Contentful Paint
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        monitoring.collectMetric('lcp', entry.startTime);
      }
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // First Input Delay
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        monitoring.collectMetric('fid', (entry as any).processingStart - entry.startTime);
      }
    }).observe({ entryTypes: ['first-input'] });

    // Cumulative Layout Shift
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          monitoring.collectMetric('cls', (entry as any).value);
        }
      }
    }).observe({ entryTypes: ['layout-shift'] });
  }
};

export default monitoring;
