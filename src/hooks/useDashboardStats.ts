import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useDashboardStats() {
  const [stats, setStats] = useState({
    totalDemandes: 0,
    demandesEnAttente: 0,
    missionsActives: 0,
    chauffeursDispo: 0,
    chiffreAffaires: 0,
    demandesTraitees: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);

        const { data: demandesData, error: demandesError } = await supabase
          .from('demandes')
          .select('id, statut');

        if (demandesError) throw new Error(`Erreur demandes: ${demandesError.message}`);

        const totalDemandes = demandesData.length;
        const demandesEnAttente = demandesData.filter(d => d.statut === 'en_attente').length;
        const demandesTraitees = demandesData.filter(d => ['validee', 'affectee', 'terminee'].includes(d.statut)).length;

        const { data: missionsData, error: missionsError } = await supabase
          .from('missions')
          .select('id, statut, montant_facture');

        if (missionsError) throw new Error(`Erreur missions: ${missionsError.message}`);

        const missionsActives = missionsData.filter(m => m.statut === 'en_cours').length;
        const chiffreAffaires = missionsData
          .filter(m => m.statut === 'terminee')
          .reduce((acc, m) => acc + (m.montant_facture || 0), 0);

        const { data: chauffeursData, error: chauffeursError } = await supabase
          .from('chauffeurs')
          .select('id, disponibilite');

        if (chauffeursError) throw new Error(`Erreur chauffeurs: ${chauffeursError.message}`);

        const chauffeursDispo = chauffeursData.filter(c => c.disponibilite === 'disponible').length;

        setStats({
          totalDemandes,
          demandesEnAttente,
          missionsActives,
          chauffeursDispo,
          chiffreAffaires,
          demandesTraitees
        });

      } catch (err: any) {
        setError(err.message);
        console.error("Erreur lors de la récupération des statistiques du dashboard:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  return { stats, loading, error };
}
