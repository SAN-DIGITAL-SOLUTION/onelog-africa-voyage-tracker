import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Settings, Send, Pause, Play, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface NotificationRule {
  id: string;
  name: string;
  trigger_event: string;
  is_active: boolean;
  mode: 'automatic' | 'manual' | 'disabled';
  channels: string[];
  template_config: any;
  conditions: any;
  created_at: string;
}

interface NotificationTemplate {
  id: string;
  name: string;
  event_type: string;
  channel: string;
  language: string;
  subject_template: string;
  body_template: string;
  variables: string[];
}

export default function NotificationControlPanel() {
  const [rules, setRules] = useState<NotificationRule[]>([]);
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRule, setSelectedRule] = useState<NotificationRule | null>(null);
  const [globalMode, setGlobalMode] = useState<'automatic' | 'manual'>('automatic');
  const { toast } = useToast();

  // Événements disponibles pour les transporteurs
  const availableEvents = [
    { id: 'mission_created', name: 'Mission créée', description: 'Nouvelle mission assignée' },
    { id: 'mission_started', name: 'Mission démarrée', description: 'Chauffeur a commencé la mission' },
    { id: 'mission_completed', name: 'Mission terminée', description: 'Livraison confirmée' },
    { id: 'position_update', name: 'Mise à jour position', description: 'Nouvelle position GPS' },
    { id: 'delay_detected', name: 'Retard détecté', description: 'Mission en retard' },
    { id: 'incident_reported', name: 'Incident signalé', description: 'Problème sur la route' },
    { id: 'invoice_generated', name: 'Facture générée', description: 'Nouvelle facture disponible' },
    { id: 'payment_received', name: 'Paiement reçu', description: 'Confirmation de paiement' }
  ];

  const channels = [
    { id: 'email', name: 'Email', icon: '📧' },
    { id: 'sms', name: 'SMS', icon: '📱' },
    { id: 'whatsapp', name: 'WhatsApp', icon: '💬' },
    { id: 'webhook', name: 'Webhook', icon: '🔗' }
  ];

  useEffect(() => {
    loadNotificationRules();
    loadNotificationTemplates();
    loadGlobalSettings();
  }, []);

  const loadNotificationRules = async () => {
    try {
      const { data, error } = await supabase
        .from('notification_rules')
        .select('*')
        .order('name');

      if (error) throw error;
      setRules(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des règles:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les règles de notification",
        variant: "destructive"
      });
    }
  };

  const loadNotificationTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('notification_templates')
        .select('*')
        .order('name');

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadGlobalSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('scope', 'global')
        .single();

      if (data) {
        setGlobalMode(data.mode || 'automatic');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres globaux:', error);
    }
  };

  const toggleRuleStatus = async (ruleId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('notification_rules')
        .update({ is_active: isActive })
        .eq('id', ruleId);

      if (error) throw error;

      setRules(rules.map(rule => 
        rule.id === ruleId ? { ...rule, is_active: isActive } : rule
      ));

      toast({
        title: "Règle mise à jour",
        description: `La règle a été ${isActive ? 'activée' : 'désactivée'}`,
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la règle:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la règle",
        variant: "destructive"
      });
    }
  };

  const updateRuleMode = async (ruleId: string, mode: 'automatic' | 'manual' | 'disabled') => {
    try {
      const { error } = await supabase
        .from('notification_rules')
        .update({ mode })
        .eq('id', ruleId);

      if (error) throw error;

      setRules(rules.map(rule => 
        rule.id === ruleId ? { ...rule, mode } : rule
      ));

      toast({
        title: "Mode mis à jour",
        description: `Mode changé vers ${mode}`,
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du mode:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le mode",
        variant: "destructive"
      });
    }
  };

  const updateGlobalMode = async (mode: 'automatic' | 'manual') => {
    try {
      const { error } = await supabase
        .from('notification_settings')
        .upsert({
          scope: 'global',
          mode,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      setGlobalMode(mode);
      toast({
        title: "Mode global mis à jour",
        description: `Toutes les notifications sont maintenant en mode ${mode}`,
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du mode global:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le mode global",
        variant: "destructive"
      });
    }
  };

  const sendTestNotification = async (ruleId: string) => {
    try {
      const { error } = await supabase.functions.invoke('send-test-notification', {
        body: { rule_id: ruleId }
      });

      if (error) throw error;

      toast({
        title: "Notification de test envoyée",
        description: "Vérifiez vos canaux de communication",
      });
    } catch (error) {
      console.error('Erreur lors de l\'envoi de test:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer la notification de test",
        variant: "destructive"
      });
    }
  };

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'automatic': return <Play className="w-4 h-4 text-green-600" />;
      case 'manual': return <Pause className="w-4 h-4 text-yellow-600" />;
      case 'disabled': return <EyeOff className="w-4 h-4 text-red-600" />;
      default: return <Settings className="w-4 h-4" />;
    }
  };

  const getModeColor = (mode: string) => {
    switch (mode) {
      case 'automatic': return 'bg-green-100 text-green-800';
      case 'manual': return 'bg-yellow-100 text-yellow-800';
      case 'disabled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec contrôles globaux */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Contrôle des Notifications
              </CardTitle>
              <CardDescription>
                Gérez les notifications automatiques et manuelles pour les transporteurs
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <Label htmlFor="global-mode">Mode global:</Label>
              <Select value={globalMode} onValueChange={updateGlobalMode}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="automatic">Automatique</SelectItem>
                  <SelectItem value="manual">Manuel</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="rules" className="space-y-4">
        <TabsList>
          <TabsTrigger value="rules">Règles de Notification</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="history">Historique</TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="space-y-4">
          {/* Liste des règles */}
          <div className="grid gap-4">
            {rules.map((rule) => (
              <Card key={rule.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={rule.is_active}
                        onCheckedChange={(checked) => toggleRuleStatus(rule.id, checked)}
                      />
                      <div>
                        <CardTitle className="text-base">{rule.name}</CardTitle>
                        <CardDescription>
                          Événement: {availableEvents.find(e => e.id === rule.trigger_event)?.name}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getModeColor(rule.mode)}>
                        {getModeIcon(rule.mode)}
                        {rule.mode}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => sendTestNotification(rule.id)}
                      >
                        <Send className="w-4 h-4 mr-1" />
                        Test
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Canaux:</span>
                      {rule.channels.map((channel) => (
                        <Badge key={channel} variant="secondary" className="text-xs">
                          {channels.find(c => c.id === channel)?.icon} {channel}
                        </Badge>
                      ))}
                    </div>
                    <Select
                      value={rule.mode}
                      onValueChange={(mode) => updateRuleMode(rule.id, mode as any)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="automatic">Automatique</SelectItem>
                        <SelectItem value="manual">Manuel</SelectItem>
                        <SelectItem value="disabled">Désactivé</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid gap-4">
            {templates.map((template) => (
              <Card key={template.id}>
                <CardHeader>
                  <CardTitle className="text-base">{template.name}</CardTitle>
                  <CardDescription>
                    {template.event_type} - {template.channel} ({template.language})
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <Label className="text-xs text-gray-600">Sujet:</Label>
                      <p className="text-sm bg-gray-50 p-2 rounded">{template.subject_template}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600">Corps:</Label>
                      <p className="text-sm bg-gray-50 p-2 rounded">{template.body_template}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600">Variables disponibles:</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {template.variables.map((variable) => (
                          <Badge key={variable} variant="outline" className="text-xs">
                            {`{{${variable}}}`}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Historique des Notifications</CardTitle>
              <CardDescription>
                Consultez l'historique des notifications envoyées
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Fonctionnalité en cours de développement...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
