import React, { useState, useEffect } from 'react';
import { Shield, Download, Trash2, Eye, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface GDPRConsent {
  id: string;
  consent_type: string;
  consent_given: boolean;
  consent_date: string;
  withdrawal_date?: string;
  legal_basis: string;
}

interface GDPRRequest {
  id: string;
  request_type: string;
  status: string;
  request_date: string;
  completion_date?: string;
  description: string;
  response_data?: any;
}

const CONSENT_TYPES = [
  {
    key: 'data_processing',
    label: 'Traitement des données personnelles',
    description: 'Autorisation pour traiter vos données dans le cadre du service',
    required: true
  },
  {
    key: 'location_tracking',
    label: 'Géolocalisation',
    description: 'Suivi de position pour les missions de transport',
    required: false
  },
  {
    key: 'marketing',
    label: 'Communications marketing',
    description: 'Réception d\'offres et communications promotionnelles',
    required: false
  },
  {
    key: 'analytics',
    label: 'Analyses et statistiques',
    description: 'Utilisation des données pour améliorer le service',
    required: false
  }
];

const REQUEST_TYPES = [
  { key: 'access', label: 'Accès aux données', description: 'Obtenir une copie de vos données personnelles' },
  { key: 'rectification', label: 'Rectification', description: 'Corriger des données inexactes' },
  { key: 'erasure', label: 'Effacement', description: 'Supprimer vos données personnelles' },
  { key: 'portability', label: 'Portabilité', description: 'Transférer vos données vers un autre service' },
  { key: 'restriction', label: 'Limitation', description: 'Limiter le traitement de vos données' },
  { key: 'objection', label: 'Opposition', description: 'S\'opposer au traitement de vos données' }
];

export default function GDPRCompliancePanel() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [consents, setConsents] = useState<GDPRConsent[]>([]);
  const [requests, setRequests] = useState<GDPRRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [newRequestType, setNewRequestType] = useState('');
  const [requestDescription, setRequestDescription] = useState('');
  const [submittingRequest, setSubmittingRequest] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserConsents();
      fetchUserRequests();
    }
  }, [user]);

  const fetchUserConsents = async () => {
    try {
      const { data, error } = await supabase
        .from('gdpr_consents')
        .select('*')
        .eq('user_id', user?.id)
        .order('consent_date', { ascending: false });

      if (error) throw error;
      setConsents(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des consentements:', error);
    }
  };

  const fetchUserRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('gdpr_requests')
        .select('*')
        .eq('user_id', user?.id)
        .order('request_date', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des demandes:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateConsent = async (consentType: string, given: boolean) => {
    try {
      const existingConsent = consents.find(c => c.consent_type === consentType && !c.withdrawal_date);
      
      if (existingConsent && !given) {
        // Retirer le consentement
        const { error } = await supabase
          .from('gdpr_consents')
          .update({ withdrawal_date: new Date().toISOString() })
          .eq('id', existingConsent.id);

        if (error) throw error;
      } else if (!existingConsent && given) {
        // Donner le consentement
        const { error } = await supabase
          .from('gdpr_consents')
          .insert({
            user_id: user?.id,
            consent_type: consentType,
            consent_given: true,
            legal_basis: 'consent'
          });

        if (error) throw error;
      }

      await fetchUserConsents();
      toast({
        title: "Consentement mis à jour",
        description: `Votre consentement pour ${CONSENT_TYPES.find(t => t.key === consentType)?.label} a été mis à jour`,
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du consentement:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le consentement",
        variant: "destructive"
      });
    }
  };

  const submitGDPRRequest = async () => {
    if (!newRequestType || !requestDescription.trim()) {
      toast({
        title: "Informations manquantes",
        description: "Veuillez sélectionner un type de demande et fournir une description",
        variant: "destructive"
      });
      return;
    }

    setSubmittingRequest(true);
    try {
      const { error } = await supabase
        .from('gdpr_requests')
        .insert({
          user_id: user?.id,
          request_type: newRequestType,
          description: requestDescription,
          status: 'pending'
        });

      if (error) throw error;

      setNewRequestType('');
      setRequestDescription('');
      await fetchUserRequests();

      toast({
        title: "Demande soumise",
        description: "Votre demande GDPR a été soumise avec succès. Nous la traiterons dans les plus brefs délais.",
      });
    } catch (error) {
      console.error('Erreur lors de la soumission de la demande:', error);
      toast({
        title: "Erreur",
        description: "Impossible de soumettre la demande",
        variant: "destructive"
      });
    } finally {
      setSubmittingRequest(false);
    }
  };

  const downloadUserData = async () => {
    try {
      const { data, error } = await supabase.rpc('export_user_data', {
        target_user_id: user?.id
      });

      if (error) throw error;

      // Créer et télécharger le fichier JSON
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mes-donnees-onelog-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Export réussi",
        description: "Vos données ont été téléchargées",
      });
    } catch (error) {
      console.error('Erreur lors de l\'export des données:', error);
      toast({
        title: "Erreur d'export",
        description: "Impossible de télécharger vos données",
        variant: "destructive"
      });
    }
  };

  const getConsentStatus = (consentType: string) => {
    const consent = consents.find(c => c.consent_type === consentType && !c.withdrawal_date);
    return consent?.consent_given || false;
  };

  const getRequestStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getRequestStatusLabel = (status: string) => {
    const labels = {
      pending: 'En attente',
      in_progress: 'En cours',
      completed: 'Terminée',
      rejected: 'Rejetée'
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Shield className="w-6 h-6 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">Protection des Données (GDPR)</h1>
      </div>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Vous avez le droit de contrôler vos données personnelles. Utilisez cette interface pour gérer vos consentements 
          et exercer vos droits selon le RGPD.
        </AlertDescription>
      </Alert>

      {/* Gestion des consentements */}
      <Card>
        <CardHeader>
          <CardTitle>Gestion des Consentements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {CONSENT_TYPES.map((consentType) => {
            const isActive = getConsentStatus(consentType.key);
            return (
              <div key={consentType.key} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Label className="font-medium">{consentType.label}</Label>
                    {consentType.required && (
                      <Badge variant="outline" className="text-xs">Requis</Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{consentType.description}</p>
                </div>
                <Switch
                  checked={isActive}
                  onCheckedChange={(checked) => updateConsent(consentType.key, checked)}
                  disabled={consentType.required && isActive} // Ne pas permettre de retirer les consentements requis
                />
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Actions rapides */}
      <Card>
        <CardHeader>
          <CardTitle>Actions Rapides</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button onClick={downloadUserData} className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Télécharger mes données
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Voir l'historique d'accès
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Nouvelle demande GDPR */}
      <Card>
        <CardHeader>
          <CardTitle>Nouvelle Demande GDPR</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Type de demande</Label>
            <select
              value={newRequestType}
              onChange={(e) => setNewRequestType(e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Sélectionner un type de demande</option>
              {REQUEST_TYPES.map((type) => (
                <option key={type.key} value={type.key}>
                  {type.label} - {type.description}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label>Description de votre demande</Label>
            <Textarea
              value={requestDescription}
              onChange={(e) => setRequestDescription(e.target.value)}
              placeholder="Décrivez votre demande en détail..."
              className="mt-1"
              rows={4}
            />
          </div>

          <Button
            onClick={submitGDPRRequest}
            disabled={submittingRequest || !newRequestType || !requestDescription.trim()}
            className="w-full"
          >
            {submittingRequest ? 'Soumission...' : 'Soumettre la demande'}
          </Button>
        </CardContent>
      </Card>

      {/* Historique des demandes */}
      <Card>
        <CardHeader>
          <CardTitle>Historique des Demandes GDPR</CardTitle>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              Aucune demande GDPR soumise
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((request) => (
                <div key={request.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Badge className={getRequestStatusColor(request.status)}>
                        {getRequestStatusLabel(request.status)}
                      </Badge>
                      <span className="font-medium">
                        {REQUEST_TYPES.find(t => t.key === request.request_type)?.label}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(request.request_date).toLocaleDateString('fr-FR')}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 mb-2">{request.description}</p>

                  {request.completion_date && (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      Terminée le {new Date(request.completion_date).toLocaleDateString('fr-FR')}
                    </div>
                  )}

                  {request.response_data && (
                    <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                      <span className="font-medium">Réponse:</span>
                      <pre className="mt-1 text-gray-700 whitespace-pre-wrap">
                        {JSON.stringify(request.response_data, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Informations légales */}
      <Card>
        <CardHeader>
          <CardTitle>Vos Droits GDPR</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-gray-600">
            <div>
              <strong>Droit d'accès:</strong> Vous pouvez demander une copie de toutes vos données personnelles.
            </div>
            <div>
              <strong>Droit de rectification:</strong> Vous pouvez demander la correction de données inexactes.
            </div>
            <div>
              <strong>Droit à l'effacement:</strong> Vous pouvez demander la suppression de vos données dans certaines conditions.
            </div>
            <div>
              <strong>Droit à la portabilité:</strong> Vous pouvez demander le transfert de vos données vers un autre service.
            </div>
            <div>
              <strong>Droit de limitation:</strong> Vous pouvez demander la limitation du traitement de vos données.
            </div>
            <div>
              <strong>Droit d'opposition:</strong> Vous pouvez vous opposer au traitement de vos données dans certains cas.
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm">
            <strong>Délai de traitement:</strong> Nous nous engageons à traiter vos demandes dans un délai maximum de 30 jours.
            Pour toute question, contactez notre DPO à l'adresse: dpo@onelog-africa.com
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
