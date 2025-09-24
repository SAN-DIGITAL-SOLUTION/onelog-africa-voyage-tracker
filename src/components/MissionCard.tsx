import { useUpdateMissionStatus } from '@/hooks/useUpdateMissionStatus';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Truck, Check, X, Flag, Loader2 } from 'lucide-react';
import { useState } from 'react';

const statusConfig = {
  en_attente: { label: 'En attente', color: 'bg-yellow-500' },
  en_cours: { label: 'En cours', color: 'bg-blue-500' },
  livree: { label: 'Livrée', color: 'bg-green-500' },
  probleme: { label: 'Problème', color: 'bg-red-500' },
  cloturee: { label: 'Clôturée', color: 'bg-gray-500' },
};

export default function MissionCard({ mission }) {
  const { updateStatus, loading } = useUpdateMissionStatus();
  const [currentStatus, setCurrentStatus] = useState(mission.status);

  const handleUpdate = async (newStatus) => {
    const success = await updateStatus(mission.id, newStatus);
    if (success) {
      setCurrentStatus(newStatus);
    }
  };

  const getStatusInfo = (status) => statusConfig[status] || { label: status, color: 'bg-gray-400' };

  const statusInfo = getStatusInfo(currentStatus);

  return (
    <Card className="mb-4 shadow-md hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">Mission #{mission.id.substring(0, 6)}...</CardTitle>
          <Badge className={`${statusInfo.color} text-white`}>{statusInfo.label}</Badge>
        </div>
        <CardDescription>
          {mission.demandes.depart} → {mission.demandes.arrivee}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600">{mission.demandes.details}</p>
        <p className="text-sm mt-2"><span className="font-semibold">Client:</span> {mission.demandes.clientName}</p>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        {loading ? (
          <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
        ) : (
          <>
            {currentStatus === 'en_attente' && (
              <Button size="sm" onClick={() => handleUpdate('en_cours')}><Truck className="h-4 w-4 mr-2" /> Démarrer</Button>
            )}
            {currentStatus === 'en_cours' && (
              <>
                <Button size="sm" variant="destructive" onClick={() => handleUpdate('probleme')}><X className="h-4 w-4 mr-2" /> Problème</Button>
                <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleUpdate('livree')}><Check className="h-4 w-4 mr-2" /> Livré</Button>
              </>
            )}
            {currentStatus === 'livree' && (
              <Button size="sm" onClick={() => handleUpdate('cloturee')}><Flag className="h-4 w-4 mr-2" /> Clôturer</Button>
            )}
          </>
        )}
      </CardFooter>
    </Card>
  );
}
