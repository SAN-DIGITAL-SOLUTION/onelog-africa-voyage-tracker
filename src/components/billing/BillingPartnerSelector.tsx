import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useBillingService } from '@/hooks/useBilling';
import { toast } from '@/components/ui/use-toast';

interface BillingPartner {
  id: string;
  name: string;
  type: 'MEDLOG' | 'MAERSK' | 'CUSTOM';
  billing_period: 'weekly' | 'biweekly' | 'monthly';
}

export const BillingPartnerSelector: React.FC = () => {
  const [selectedPartner, setSelectedPartner] = useState<string>('');
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [isGenerating, setIsGenerating] = useState(false);

  const billingService = useBillingService();

  // Chargement des partenaires
  const { data: partners = [], isLoading } = useQuery({
    queryKey: ['billing-partners'],
    queryFn: () => billingService.getPartners(),
  });

  const handleGenerateInvoices = async () => {
    if (!selectedPartner || !startDate || !endDate) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un partenaire et une période",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const pdfUrl = await billingService.generateGroupedInvoice(
        selectedPartner,
        startDate,
        endDate
      );

      toast({
        title: "Facture générée avec succès",
        description: "Le PDF va s'ouvrir dans un nouvel onglet.",
      });

      window.open(pdfUrl, '_blank');
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la génération des factures",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case 'weekly': return 'Hebdomadaire';
      case 'biweekly': return 'Bi-mensuelle';
      case 'monthly': return 'Mensuelle';
      default: return period;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Facturation Multi-Acteurs
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Générez des factures groupées pour vos partenaires (MEDLOG, MAERSK, etc.)
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Sélection du partenaire */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Partenaire de facturation</label>
            <Select value={selectedPartner} onValueChange={setSelectedPartner}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un partenaire" />
              </SelectTrigger>
              <SelectContent>
                {isLoading ? (
                  <SelectItem value="loading" disabled>Chargement...</SelectItem>
                ) : (
                  partners.map((partner) => (
                    <SelectItem key={partner.id} value={partner.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{partner.name}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          {getPeriodLabel(partner.billing_period)}
                        </span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Sélection de la période */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Date de début</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP", { locale: fr }) : "Sélectionner"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Date de fin</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP", { locale: fr }) : "Sélectionner"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Bouton de génération */}
          <Button
            onClick={handleGenerateInvoices}
            disabled={isGenerating || !selectedPartner || !startDate || !endDate}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Génération en cours...
              </>
            ) : (
              'Générer les factures groupées'
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Aperçu des générations récentes */}
      <RecentInvoices partnerId={selectedPartner} />
    </div>
  );
};

const RecentInvoices: React.FC<{ partnerId: string }> = ({ partnerId }) => {
  const billingService = useBillingService();

  const { data: invoices = [] } = useQuery({
    queryKey: ['invoices', partnerId],
    queryFn: () => billingService.getInvoicesByPartner(partnerId),
    enabled: !!partnerId,
  });

  if (!partnerId || invoices.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">
          Factures récentes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {invoices.slice(0, 5).map((invoice) => (
            <div key={invoice.id} className="flex items-center justify-between p-2 border rounded-lg">
              <div>
                <p className="font-medium">
                  Période: {format(new Date(invoice.period_start), "MMM yyyy", { locale: fr })}
                </p>
                <p className="text-sm text-muted-foreground">
                  {invoice.total_amount?.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                </p>
              </div>
              <div className="text-sm">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  invoice.status === 'sent' ? 'bg-green-100 text-green-800' :
                  invoice.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {invoice.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
