import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BillingService } from '@/services/billingService';
import type { BillingPartner, GroupedInvoice } from '@/types/billing';

const billingService = new BillingService();

export function useBillingPartners() {
  return useQuery({
    queryKey: ['billing-partners'],
    queryFn: () => billingService.getBillingPartners(),
  });
}

export function useInvoicesByPartner(partnerId: string) {
  return useQuery({
    queryKey: ['invoices', partnerId],
    queryFn: () => billingService.getInvoicesByPartner(partnerId),
    enabled: !!partnerId,
  });
}

export function useGenerateInvoices() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ partnerId, startDate, endDate }: {
      partnerId: string;
      startDate: Date;
      endDate: Date;
    }) => billingService.generatePeriodicInvoices(partnerId, startDate, endDate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
}

export function useBillingService() {
  return {
    getPartners: () => billingService.getBillingPartners(),
    getInvoicesByPartner: (partnerId: string) => billingService.getInvoicesByPartner(partnerId),
    generatePeriodicInvoices: (partnerId: string, startDate: Date, endDate: Date) => 
      billingService.generatePeriodicInvoices(partnerId, startDate, endDate),
    sendInvoice: (invoiceId: string, email: string) => billingService.sendInvoice(invoiceId, email),
  };
}
