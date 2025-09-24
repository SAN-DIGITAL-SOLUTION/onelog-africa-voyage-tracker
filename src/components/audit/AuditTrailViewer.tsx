import React, { useState, useEffect } from 'react';
import { Shield, Eye, Download, Filter, Calendar, User, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

interface AuditLog {
  id: string;
  user_email: string;
  user_role: string;
  action_type: string;
  resource_type: string;
  resource_id: string;
  timestamp: string;
  success: boolean;
  ip_address: string;
  metadata: any;
}

interface AuditFilters {
  action_type: string;
  resource_type: string;
  user_role: string;
  date_from: string;
  date_to: string;
  user_email: string;
}

export default function AuditTrailViewer() {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<AuditFilters>({
    action_type: '',
    resource_type: '',
    user_role: '',
    date_from: '',
    date_to: '',
    user_email: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { toast } = useToast();

  const ITEMS_PER_PAGE = 50;

  useEffect(() => {
    fetchAuditLogs();
  }, [filters, currentPage]);

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('audit_logs')
        .select('*', { count: 'exact' })
        .order('timestamp', { ascending: false })
        .range((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE - 1);

      // Appliquer les filtres
      if (filters.action_type) {
        query = query.eq('action_type', filters.action_type);
      }
      if (filters.resource_type) {
        query = query.eq('resource_type', filters.resource_type);
      }
      if (filters.user_role) {
        query = query.eq('user_role', filters.user_role);
      }
      if (filters.user_email) {
        query = query.ilike('user_email', `%${filters.user_email}%`);
      }
      if (filters.date_from) {
        query = query.gte('timestamp', filters.date_from);
      }
      if (filters.date_to) {
        query = query.lte('timestamp', filters.date_to + 'T23:59:59');
      }

      const { data, error, count } = await query;

      if (error) throw error;

      setAuditLogs(data || []);
      setTotalPages(Math.ceil((count || 0) / ITEMS_PER_PAGE));
    } catch (error) {
      console.error('Erreur lors du chargement des logs d\'audit:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les logs d'audit",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const exportAuditLogs = async () => {
    try {
      const { data, error } = await supabase.rpc('generate_compliance_report', {
        start_date: filters.date_from || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end_date: filters.date_to || new Date().toISOString().split('T')[0]
      });

      if (error) throw error;

      // Créer et télécharger le fichier JSON
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-report-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Export réussi",
        description: "Le rapport d'audit a été téléchargé",
      });
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      toast({
        title: "Erreur d'export",
        description: "Impossible de générer le rapport",
        variant: "destructive"
      });
    }
  };

  const getActionColor = (action: string) => {
    const colors = {
      CREATE: 'bg-green-100 text-green-800',
      UPDATE: 'bg-blue-100 text-blue-800',
      DELETE: 'bg-red-100 text-red-800',
      LOGIN: 'bg-purple-100 text-purple-800',
      LOGOUT: 'bg-gray-100 text-gray-800',
      EXPORT: 'bg-orange-100 text-orange-800',
      VIEW: 'bg-cyan-100 text-cyan-800'
    };
    return colors[action] || 'bg-gray-100 text-gray-800';
  };

  const getRoleColor = (role: string) => {
    const colors = {
      admin: 'bg-red-100 text-red-800',
      exploiteur: 'bg-blue-100 text-blue-800',
      chauffeur: 'bg-green-100 text-green-800',
      client: 'bg-purple-100 text-purple-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  const updateFilter = (key: keyof AuditFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      action_type: '',
      resource_type: '',
      user_role: '',
      date_from: '',
      date_to: '',
      user_email: ''
    });
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Audit Trail</h1>
        </div>
        <Button onClick={exportAuditLogs} className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Exporter le rapport
        </Button>
      </div>

      {/* Filtres */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filtres de recherche
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div>
              <Label>Type d'action</Label>
              <Select value={filters.action_type} onValueChange={(value) => updateFilter('action_type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Toutes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Toutes</SelectItem>
                  <SelectItem value="CREATE">Création</SelectItem>
                  <SelectItem value="UPDATE">Modification</SelectItem>
                  <SelectItem value="DELETE">Suppression</SelectItem>
                  <SelectItem value="LOGIN">Connexion</SelectItem>
                  <SelectItem value="LOGOUT">Déconnexion</SelectItem>
                  <SelectItem value="EXPORT">Export</SelectItem>
                  <SelectItem value="VIEW">Consultation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Type de ressource</Label>
              <Select value={filters.resource_type} onValueChange={(value) => updateFilter('resource_type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Toutes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Toutes</SelectItem>
                  <SelectItem value="missions">Missions</SelectItem>
                  <SelectItem value="users">Utilisateurs</SelectItem>
                  <SelectItem value="invoices">Factures</SelectItem>
                  <SelectItem value="notifications">Notifications</SelectItem>
                  <SelectItem value="profiles">Profils</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Rôle utilisateur</Label>
              <Select value={filters.user_role} onValueChange={(value) => updateFilter('user_role', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tous</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="exploiteur">Exploiteur</SelectItem>
                  <SelectItem value="chauffeur">Chauffeur</SelectItem>
                  <SelectItem value="client">Client</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Date de début</Label>
              <Input
                type="date"
                value={filters.date_from}
                onChange={(e) => updateFilter('date_from', e.target.value)}
              />
            </div>

            <div>
              <Label>Date de fin</Label>
              <Input
                type="date"
                value={filters.date_to}
                onChange={(e) => updateFilter('date_to', e.target.value)}
              />
            </div>

            <div>
              <Label>Email utilisateur</Label>
              <Input
                placeholder="Rechercher..."
                value={filters.user_email}
                onChange={(e) => updateFilter('user_email', e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button variant="outline" onClick={clearFilters}>
              Effacer les filtres
            </Button>
            <Button onClick={fetchAuditLogs}>
              Rechercher
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Liste des logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Logs d'audit ({auditLogs.length})
            </span>
            <div className="text-sm text-gray-500">
              Page {currentPage} sur {totalPages}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : auditLogs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Aucun log d'audit trouvé
            </div>
          ) : (
            <div className="space-y-2">
              {auditLogs.map((log) => (
                <div key={log.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Badge className={getActionColor(log.action_type)}>
                        {log.action_type}
                      </Badge>
                      <Badge variant="outline">
                        {log.resource_type}
                      </Badge>
                      {log.user_role && (
                        <Badge className={getRoleColor(log.user_role)}>
                          {log.user_role}
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(log.timestamp).toLocaleString('fr-FR')}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">Utilisateur:</span>
                      <div className="flex items-center gap-2">
                        <User className="w-3 h-3" />
                        {log.user_email || 'Système'}
                      </div>
                    </div>

                    {log.resource_id && (
                      <div>
                        <span className="font-medium text-gray-600">Ressource ID:</span>
                        <div className="font-mono text-xs">{log.resource_id}</div>
                      </div>
                    )}

                    {log.ip_address && (
                      <div>
                        <span className="font-medium text-gray-600">Adresse IP:</span>
                        <div className="font-mono text-xs">{log.ip_address}</div>
                      </div>
                    )}
                  </div>

                  {log.metadata && Object.keys(log.metadata).length > 0 && (
                    <div className="mt-3 p-2 bg-gray-100 rounded text-xs">
                      <span className="font-medium text-gray-600">Métadonnées:</span>
                      <pre className="mt-1 text-gray-700">
                        {JSON.stringify(log.metadata, null, 2)}
                      </pre>
                    </div>
                  )}

                  {!log.success && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                      <span className="font-medium">Erreur:</span> Action échouée
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Précédent
              </Button>
              
              <span className="text-sm text-gray-600">
                Page {currentPage} sur {totalPages}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Suivant
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
