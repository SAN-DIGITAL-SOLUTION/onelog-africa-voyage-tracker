import { useState } from 'react';
import { useDemandes } from '../../hooks/useDemandes';
import { useChauffeursDisponibles } from '../../hooks/useChauffeursDisponibles';
import { useCreateMission } from '../../hooks/useCreateMission';
import { Loader2, AlertCircle, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';

function AffectationCard({ demande, chauffeurs, onMissionCreated }) {
  const [selectedChauffeur, setSelectedChauffeur] = useState('');
  const { createMission, loading, error } = useCreateMission();

  const handleAffecter = async () => {
    if (!selectedChauffeur) {
      toast({ title: 'Erreur', description: 'Veuillez sélectionner un chauffeur.', variant: 'destructive' });
      return;
    }

    const mission = await createMission({ demande_id: demande.id, chauffeur_id: selectedChauffeur });

    if (mission) {
      toast({ title: 'Succès', description: `Mission créée et affectée à ${chauffeurs.find(c => c.id === selectedChauffeur)?.prenom}.` });
      onMissionCreated(demande.id);
    } else if (error) {
        toast({ title: 'Erreur', description: error, variant: 'destructive' });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Demande #{demande.id.substring(0, 6)}</CardTitle>
        <CardDescription>De {demande.depart} à {demande.arrivee}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm">{demande.details}</p>
        <Select onValueChange={setSelectedChauffeur} value={selectedChauffeur}>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner un chauffeur" />
          </SelectTrigger>
          <SelectContent>
            {chauffeurs.map(chauffeur => (
              <SelectItem key={chauffeur.id} value={chauffeur.id}>
                {chauffeur.prenom} {chauffeur.nom}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={handleAffecter} disabled={loading || !selectedChauffeur} className="w-full">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserCheck className="h-4 w-4 mr-2" />} 
          Affecter la mission
        </Button>
      </CardContent>
    </Card>
  );
}

export default function AffectationsPage() {
  const { demandes, loading: loadingDemandes, error: errorDemandes, setDemandes } = useDemandes('validee');
  const { chauffeurs, loading: loadingChauffeurs, error: errorChauffeurs } = useChauffeursDisponibles();

  const handleMissionCreated = (demandeId) => {
    // @ts-ignore
    setDemandes(prev => prev.filter(d => d.id !== demandeId));
  };

  const isLoading = loadingDemandes || loadingChauffeurs;
  const anError = errorDemandes || errorChauffeurs;

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }

  if (anError) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-red-50">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <h2 className="mt-4 text-xl font-semibold text-red-700">Erreur de chargement</h2>
        <p className="mt-2 text-gray-600">{anError}</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Affectation des Chauffeurs</h1>
      {demandes.length === 0 ? (
        <div className="text-center py-12 px-6 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-700">Aucune demande validée en attente</h3>
          <p className="mt-2 text-sm text-gray-500">Validez de nouvelles demandes pour pouvoir les affecter.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {demandes.map(demande => (
            <AffectationCard key={demande.id} demande={demande} chauffeurs={chauffeurs} onMissionCreated={handleMissionCreated} />
          ))}
        </div>
      )}
    </div>
  );
}
